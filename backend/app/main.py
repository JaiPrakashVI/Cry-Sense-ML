"""
CrySense API — FastAPI application entry-point.

Configures middleware (CORS, security headers, rate limiting, request
logging), registers all route modules, and exposes the ASGI ``app``
instance for Uvicorn.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
import static_ffmpeg

# Add static ffmpeg binaries to PATH
static_ffmpeg.add_paths()

from backend.app.routes.audio import router as audio_router
from backend.app.routes.health import router as health_router
from backend.app.routes.predictions import router as predictions_router
from backend.app.routes.contact import router as contact_router
from backend.app.utils.config import get_settings
from backend.app.utils.logging import configure_logging
from backend.app.utils.rate_limit import InMemoryRateLimiter

settings = get_settings()
configure_logging()
LOGGER = logging.getLogger(__name__)
rate_limiter = InMemoryRateLimiter()

app = FastAPI(
    title="CrySense API",
    version="1.0.0",
    description="AI-powered emotional distress detection from uploaded or recorded audio."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.(vercel\.app|netlify\.app|railway\.app|render\.com|onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health_router)
app.include_router(audio_router)
app.include_router(predictions_router)
app.include_router(contact_router)


# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add defence-in-depth security headers to every response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


# ---------------------------------------------------------------------------
# Rate-limiting & request-logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    start = time.perf_counter()
    try:
        rate_limiter.check(request)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    LOGGER.info("[Request Started] method=%s path=%s", request.method, request.url.path)
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    LOGGER.info(
        "[Request Complete] method=%s path=%s status=%s elapsed_ms=%.2f",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms
    )
    return response
