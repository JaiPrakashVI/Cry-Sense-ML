"""
Security utilities for CrySense API.

Provides file magic-byte validation, safe error message sanitization,
and unique request-ID generation.
"""

import logging
import uuid
from pathlib import Path

LOGGER = logging.getLogger(__name__)

# Magic byte signatures for supported audio formats
_MAGIC_SIGNATURES: list[tuple[str, bytes, int]] = [
    ("WAV/RIFF", b"RIFF", 0),
    ("FLAC", b"fLaC", 0),
    ("OGG", b"OggS", 0),
    ("MP3/ID3", b"ID3", 0),
]

# MP3 sync-word: first byte 0xFF, second byte upper nibble 0xE or 0xF
_MP3_SYNC_FIRST_BYTE = 0xFF


def validate_file_magic(file_path: Path) -> bool:
    """Check that a file's magic bytes match a known audio format.

    Supports WAV (RIFF), MP3 (ID3 tag or sync-word), FLAC, OGG,
    WebM, and M4A/MP4 containers.

    Args:
        file_path: Path to the audio file on disk.

    Returns:
        ``True`` if the file's header matches a recognised audio format.
    """
    try:
        with open(file_path, "rb") as fh:
            header = fh.read(32)
    except OSError:
        LOGGER.warning("Cannot read file for magic-byte check: %s", file_path.name)
        return False

    if len(header) < 4:
        return False

    # Check standard signatures (WAV, FLAC, OGG, ID3-tagged MP3)
    for name, magic, offset in _MAGIC_SIGNATURES:
        end = offset + len(magic)
        if header[offset:end] == magic:
            LOGGER.debug("Magic match: %s for %s", name, file_path.name)
            return True

    # MP3 sync-word (no ID3 tag)
    if header[0] == _MP3_SYNC_FIRST_BYTE and (header[1] & 0xE0) == 0xE0:
        LOGGER.debug("Magic match: MP3 sync-word for %s", file_path.name)
        return True

    # WebM / Matroska (starts with 0x1A45DFA3 — EBML header)
    if header[:4] == b"\x1a\x45\xdf\xa3":
        LOGGER.debug("Magic match: WebM/Matroska for %s", file_path.name)
        return True

    # M4A / MP4 / MOV — ftyp box at offset 4
    if header[4:8] == b"ftyp":
        LOGGER.debug("Magic match: M4A/MP4 for %s", file_path.name)
        return True

    LOGGER.debug("No magic match for %s", file_path.name)
    return False


def sanitize_error_message(error: Exception) -> str:
    """Return a safe, user-facing error message.

    Strips internal file-system paths, class names, and stack-trace details
    so that sensitive server information is never leaked to callers.

    Args:
        error: The original exception.

    Returns:
        A sanitised string safe for inclusion in API responses.
    """
    raw = str(error)

    # Strip anything that looks like a filesystem path
    # (e.g. /home/user/project/..., C:\\Users\\...)
    import re
    raw = re.sub(r"[A-Za-z]:\\[^\s:\"']+", "<path>", raw)
    raw = re.sub(r"/[^\s:\"']{3,}", "<path>", raw)

    # Strip Python exception class prefixes (e.g. "ValueError: ...")
    raw = re.sub(r"^[A-Za-z_]+Error:\s*", "", raw)

    # Trim overly long messages
    if len(raw) > 200:
        raw = raw[:200] + "…"

    return raw.strip() or "An internal error occurred"


def generate_request_id() -> str:
    """Generate a unique request ID for tracking and correlation.

    Returns:
        A 32-character hex string derived from UUID4.
    """
    return uuid.uuid4().hex
