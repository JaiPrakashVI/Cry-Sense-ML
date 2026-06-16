"""
JWT authentication utilities for Supabase token verification.

Provides FastAPI dependencies for extracting and verifying Supabase JWTs
from the Authorization header. Supports both required and optional auth.
"""

import logging
from typing import Optional

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, Request, status

from backend.app.utils.config import get_settings

LOGGER = logging.getLogger(__name__)

_JWK_CLIENT = None


def get_jwk_client(supabase_url: str) -> PyJWKClient:
    """Gets or initializes the PyJWKClient instance for fetching Supabase public keys."""
    global _JWK_CLIENT
    if _JWK_CLIENT is None:
        jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        _JWK_CLIENT = PyJWKClient(jwks_url)
    return _JWK_CLIENT


def verify_supabase_token(token: str) -> dict:
    """Decode and verify a Supabase JWT token.

    Supports both symmetric (HS256) and asymmetric (ES256, RS256) keys.

    Args:
        token: The raw JWT string from the Authorization header.

    Returns:
        A dict with at minimum ``{'user_id': str}`` extracted from the
        token's ``sub`` claim, plus the full decoded payload under ``'payload'``.

    Raises:
        ValueError: If the token is expired, malformed, or otherwise invalid.
    """
    settings = get_settings()

    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
    except Exception as exc:
        LOGGER.warning("Failed to parse JWT header: %s", exc)
        raise ValueError("Invalid authentication token format")

    try:
        if alg == "HS256":
            jwt_secret = settings.supabase_jwt_secret
            if not jwt_secret:
                LOGGER.error("Supabase JWT secret is not configured")
                raise ValueError("Authentication is not configured on the server")

            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_aud": True},
            )
        elif alg in ("ES256", "RS256"):
            supabase_url = settings.supabase_url
            if not supabase_url:
                LOGGER.error("Supabase URL is not configured")
                raise ValueError("Authentication is not configured on the server")

            jwk_client = get_jwk_client(supabase_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token)

            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
                options={"verify_aud": True},
            )
        else:
            LOGGER.warning("Unsupported JWT algorithm: %s", alg)
            raise ValueError(f"Unsupported authentication algorithm: {alg}")

    except jwt.ExpiredSignatureError:
        LOGGER.warning("Expired JWT token received")
        raise ValueError("Token has expired")
    except jwt.InvalidAudienceError:
        LOGGER.warning("JWT with invalid audience received")
        raise ValueError("Invalid token audience")
    except jwt.PyJWTError as exc:
        LOGGER.warning("JWT verification error: %s", exc)
        raise ValueError("Invalid authentication token")

    user_id = payload.get("sub")
    if not user_id:
        LOGGER.warning("JWT token missing 'sub' claim")
        raise ValueError("Token missing user identifier")

    return {
        "user_id": user_id,
        "email": payload.get("email"),
        "role": payload.get("role"),
        "payload": payload,
    }


async def get_current_user(request: Request) -> dict:
    """FastAPI dependency that requires a valid Supabase JWT.

    Extracts the Bearer token from the Authorization header, verifies it,
    and returns the user information dictionary.

    Raises:
        HTTPException: 401 if the token is missing or invalid.
    """
    auth_header: Optional[str] = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_info = verify_supabase_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_info


async def get_optional_user(request: Request) -> Optional[dict]:
    """FastAPI dependency that optionally extracts user info from a JWT.

    Returns ``None`` instead of raising when the token is absent or invalid.
    Useful for endpoints that behave differently for authenticated users.
    """
    try:
        return await get_current_user(request)
    except HTTPException:
        return None
