"""
Contact-form routes for CrySense API.

Allows authenticated users to submit feedback or support messages that
are persisted in Supabase.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from backend.app.services import supabase_service
from backend.app.utils.auth import get_current_user

router = APIRouter(prefix="/contact", tags=["contact"])
LOGGER = logging.getLogger(__name__)


class ContactRequest(BaseModel):
    """Schema for the contact-form payload."""
    name: str
    email: EmailStr
    message: str


@router.post("")
async def submit_contact(
    body: ContactRequest,
    user: dict = Depends(get_current_user),
):
    """Save a contact / feedback message from an authenticated user."""
    user_id = user["user_id"]
    try:
        saved = supabase_service.save_contact_message(
            user_id=user_id,
            name=body.name,
            email=body.email,
            message=body.message,
        )
        return {"detail": "Message received", "id": saved.get("id")}
    except Exception:
        LOGGER.exception("Failed to save contact message from user %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save your message. Please try again later.",
        )
