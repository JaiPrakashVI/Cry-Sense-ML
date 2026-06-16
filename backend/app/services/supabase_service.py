"""
Supabase service layer for CrySense.

Provides server-side operations against the Supabase database using the
service-role key.  Handles predictions CRUD and contact-form persistence.
"""

import logging
from typing import Optional

from backend.app.utils.config import get_settings

LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy singleton client
# ---------------------------------------------------------------------------
_client = None


def _get_client():
    """Return a lazily-initialised Supabase client (service-role)."""
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.supabase_url or not settings.supabase_service_key:
            LOGGER.error("Supabase URL or service key not configured")
            raise RuntimeError("Supabase is not configured")
        from supabase import create_client
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
        LOGGER.info("Supabase client initialised (service-role)")
    return _client


# ---------------------------------------------------------------------------
# Predictions
# ---------------------------------------------------------------------------

def save_prediction(user_id: str, prediction: dict) -> dict:
    """Insert a new prediction row into the ``predictions`` table.

    Args:
        user_id: The authenticated user's UUID.
        prediction: Dict containing at minimum *emotion*, *distress_score*,
            *confidence_score*, *risk_category*, *summary*,
            *emotion_distribution*, *audio_filename*, and
            *audio_duration_seconds*.

    Returns:
        The inserted row as a dict.
    """
    try:
        client = _get_client()
        row = {
            "user_id": user_id,
            "emotion": prediction.get("emotion"),
            "distress_score": prediction.get("distress_score"),
            "confidence_score": prediction.get("confidence_score"),
            "risk_category": prediction.get("risk_category"),
            "summary": prediction.get("summary"),
            "emotion_distribution": prediction.get("emotion_distribution"),
            "audio_filename": prediction.get("audio_filename"),
            "audio_duration_seconds": prediction.get("audio_duration_seconds"),
        }
        result = client.table("predictions").insert(row).execute()
        LOGGER.info("Prediction saved for user %s", user_id)
        return result.data[0] if result.data else row
    except Exception:
        LOGGER.exception("Failed to save prediction for user %s", user_id)
        raise


def get_user_predictions(
    user_id: str, limit: int = 20, offset: int = 0
) -> list[dict]:
    """Fetch a page of predictions for a user, newest first.

    Args:
        user_id: The user's UUID.
        limit: Maximum rows to return.
        offset: Number of rows to skip (pagination).

    Returns:
        A list of prediction dicts ordered by ``created_at`` descending.
    """
    try:
        client = _get_client()
        result = (
            client.table("predictions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return result.data or []
    except Exception:
        LOGGER.exception("Failed to fetch predictions for user %s", user_id)
        raise


def get_prediction_count(user_id: str) -> int:
    """Return the total number of predictions for a user.

    Args:
        user_id: The user's UUID.

    Returns:
        An integer count.
    """
    try:
        client = _get_client()
        result = (
            client.table("predictions")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        return result.count if result.count is not None else 0
    except Exception:
        LOGGER.exception("Failed to count predictions for user %s", user_id)
        raise


def delete_prediction(user_id: str, prediction_id: str) -> bool:
    """Delete a specific prediction belonging to a user.

    Args:
        user_id: The user's UUID (ownership check).
        prediction_id: The prediction row UUID.

    Returns:
        ``True`` if a row was deleted, ``False`` otherwise.
    """
    try:
        client = _get_client()
        result = (
            client.table("predictions")
            .delete()
            .eq("id", prediction_id)
            .eq("user_id", user_id)
            .execute()
        )
        deleted = bool(result.data)
        LOGGER.info(
            "Delete prediction %s for user %s — deleted=%s",
            prediction_id, user_id, deleted,
        )
        return deleted
    except Exception:
        LOGGER.exception(
            "Failed to delete prediction %s for user %s",
            prediction_id, user_id,
        )
        raise


# ---------------------------------------------------------------------------
# Contact messages
# ---------------------------------------------------------------------------

def save_contact_message(
    user_id: Optional[str], name: str, email: str, message: str
) -> dict:
    """Persist a contact-form submission.

    Args:
        user_id: The authenticated user's UUID, or ``None`` for anonymous.
        name: Sender name.
        email: Sender email address.
        message: The message body.

    Returns:
        The inserted row as a dict.
    """
    try:
        client = _get_client()
        row = {
            "user_id": user_id,
            "name": name,
            "email": email,
            "message": message,
        }
        result = client.table("contact_messages").insert(row).execute()
        LOGGER.info("Contact message saved from %s", email)
        return result.data[0] if result.data else row
    except Exception:
        LOGGER.exception("Failed to save contact message from %s", email)
        raise
