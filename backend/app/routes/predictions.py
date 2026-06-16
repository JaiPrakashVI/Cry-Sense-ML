"""
Prediction-history routes for CrySense API.

All endpoints require Supabase authentication.  Users can list, retrieve,
delete, and view statistics about their past predictions.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.services import supabase_service
from backend.app.utils.auth import get_current_user

router = APIRouter(prefix="/predictions", tags=["predictions"])
LOGGER = logging.getLogger(__name__)


@router.get("")
async def list_predictions(
    limit: int = 20,
    offset: int = 0,
    user: dict = Depends(get_current_user),
):
    """Return the authenticated user's prediction history (paginated)."""
    user_id = user["user_id"]
    try:
        predictions = supabase_service.get_user_predictions(
            user_id, limit=limit, offset=offset,
        )
        total = supabase_service.get_prediction_count(user_id)
        return {"predictions": predictions, "total": total, "limit": limit, "offset": offset}
    except Exception:
        LOGGER.exception("Failed to list predictions for user %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prediction history",
        )


@router.get("/stats")
async def prediction_stats(user: dict = Depends(get_current_user)):
    """Return aggregate statistics for the authenticated user."""
    user_id = user["user_id"]
    try:
        predictions = supabase_service.get_user_predictions(
            user_id, limit=1000, offset=0,
        )
        total = len(predictions)

        if total == 0:
            return {
                "total_predictions": 0,
                "most_common_emotion": None,
                "average_distress_score": None,
            }

        # Most common emotion
        emotion_counts: dict[str, int] = {}
        distress_total = 0.0
        for pred in predictions:
            emotion = pred.get("emotion", "unknown")
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            distress_total += pred.get("distress_score", 0) or 0

        most_common_emotion = max(emotion_counts, key=emotion_counts.get)  # type: ignore[arg-type]
        average_distress = round(distress_total / total, 2)

        return {
            "total_predictions": total,
            "most_common_emotion": most_common_emotion,
            "average_distress_score": average_distress,
        }
    except Exception:
        LOGGER.exception("Failed to compute stats for user %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compute prediction statistics",
        )


@router.get("/{prediction_id}")
async def get_prediction(
    prediction_id: str,
    user: dict = Depends(get_current_user),
):
    """Return a single prediction (must belong to the authenticated user)."""
    user_id = user["user_id"]
    try:
        from backend.app.services.supabase_service import _get_client
        client = _get_client()
        result = (
            client.table("predictions")
            .select("*")
            .eq("id", prediction_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction not found",
            )
        return result.data[0]
    except HTTPException:
        raise
    except Exception:
        LOGGER.exception(
            "Failed to get prediction %s for user %s", prediction_id, user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prediction",
        )


@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a prediction (must belong to the authenticated user)."""
    user_id = user["user_id"]
    try:
        deleted = supabase_service.delete_prediction(user_id, prediction_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction not found or already deleted",
            )
        return {"detail": "Prediction deleted", "id": prediction_id}
    except HTTPException:
        raise
    except Exception:
        LOGGER.exception(
            "Failed to delete prediction %s for user %s", prediction_id, user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete prediction",
        )
