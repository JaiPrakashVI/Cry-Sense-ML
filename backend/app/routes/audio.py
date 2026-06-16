"""
Audio analysis routes for CrySense API.

Provides endpoints for uploading / recording audio files and returning
emotion-distress predictions.  All analysis endpoints require Supabase
authentication; the ``/audio-health`` endpoint remains public.
"""

import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from backend.app.models.audio import AudioHealthResponse
from backend.app.models.schemas import PredictionResponse
from backend.app.routes.health import inference_service
from backend.app.services.audio_validation import (
    SUPPORTED_CONTENT_TYPES,
    validate_saved_file,
    validate_upload_metadata,
)
from backend.app.services.prediction_service import PredictionService
from backend.app.services.storage_service import StorageService
from backend.app.services import supabase_service
from backend.app.utils.auth import get_current_user
from backend.app.utils.config import get_settings
from backend.app.utils.security import generate_request_id, sanitize_error_message

router = APIRouter(tags=["audio"])
settings = get_settings()
storage = StorageService(settings.storage_dir)
prediction_service = PredictionService(inference_service)
LOGGER = logging.getLogger(__name__)


@router.post("/upload-audio", response_model=PredictionResponse)
async def upload_audio(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
) -> PredictionResponse:
    """Upload a pre-recorded audio file for analysis."""
    return await _analyze(file, user)


@router.post("/record-audio", response_model=PredictionResponse)
async def record_audio(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
) -> PredictionResponse:
    """Upload a browser-recorded audio clip for analysis."""
    return await _analyze(file, user)


@router.post("/analyze", response_model=PredictionResponse)
async def analyze(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
) -> PredictionResponse:
    """Core analysis endpoint — accepts any supported audio format."""
    return await _analyze(file, user)


async def _analyze(file: UploadFile, user: dict) -> PredictionResponse:
    """Shared implementation for all analysis endpoints."""
    trace_id = generate_request_id()
    user_id = user["user_id"]
    LOGGER.info(
        "[API Received] trace_id=%s endpoint=/analyze filename=%s user=%s",
        trace_id, file.filename, user_id,
    )
    audio_path = None
    try:
        validate_upload_metadata(file)
        audio_path = await storage.save_upload(file)
        LOGGER.info("[File Saved] trace_id=%s path=%s", trace_id, audio_path)

        metadata = validate_saved_file(
            audio_path,
            original_filename=file.filename or audio_path.name,
            content_type=file.content_type or "application/octet-stream",
        )

        result: PredictionResponse = prediction_service.analyze(metadata, trace_id)

        # ---- persist to Supabase ----
        try:
            supabase_service.save_prediction(
                user_id=user_id,
                prediction={
                    "emotion": result.emotion,
                    "distress_score": result.distress_score,
                    "confidence_score": result.confidence_score,
                    "risk_category": result.risk_category,
                    "summary": result.summary,
                    "emotion_distribution": result.emotion_distribution,
                    "audio_filename": file.filename or audio_path.name,
                    "audio_duration_seconds": result.audio_details.get(
                        "duration_seconds"
                    ),
                },
            )
        except Exception:
            # Non-fatal: prediction was already computed; log and continue
            LOGGER.exception(
                "[Supabase Save Failed] trace_id=%s — returning result anyway",
                trace_id,
            )

        return result

    except HTTPException:
        LOGGER.exception("[Audio Analysis Failed] trace_id=%s", trace_id)
        raise
    except Exception as exc:
        LOGGER.exception("[Audio Analysis Failed] trace_id=%s", trace_id)
        safe_msg = sanitize_error_message(exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio analysis failed for trace {trace_id}: {safe_msg}",
        ) from exc
    finally:
        # ---- auto-cleanup uploaded file ----
        if audio_path and settings.auto_cleanup_uploads:
            storage.delete_file(audio_path)


@router.get("/audio-health", response_model=AudioHealthResponse)
async def audio_health() -> AudioHealthResponse:
    """Public health-check for the audio subsystem."""
    return AudioHealthResponse(
        status="ok",
        supported_content_types=sorted(SUPPORTED_CONTENT_TYPES),
        max_upload_mb=settings.max_upload_mb,
        converter="librosa+soundfile wav normalization",
    )
