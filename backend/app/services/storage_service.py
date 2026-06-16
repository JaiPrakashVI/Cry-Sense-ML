"""
File-storage service for CrySense.

Handles saving uploaded audio files to a local directory, deleting files
after analysis, and periodic cleanup of stale uploads.
"""

import logging
import time
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

LOGGER = logging.getLogger(__name__)


class StorageService:
    def __init__(self, root_dir: str) -> None:
        self.root = Path(root_dir)
        self.root.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload: UploadFile) -> Path:
        """Persist an uploaded file to disk and return its path."""
        suffix = Path(upload.filename or "audio.webm").suffix or ".webm"
        destination = self.root / f"{uuid4().hex}{suffix}"
        content = await upload.read()
        if not content:
            raise ValueError("Uploaded audio is empty.")
        destination.write_bytes(content)
        return destination

    def delete_file(self, path: Path) -> bool:
        """Delete a single file safely.

        Args:
            path: Absolute or relative path to the file.

        Returns:
            ``True`` if the file was deleted, ``False`` if it did not
            exist or an error occurred.
        """
        try:
            if path.exists():
                path.unlink()
                LOGGER.info("[File Deleted] path=%s", path)
                return True
            LOGGER.debug("[File Not Found] path=%s — nothing to delete", path)
            return False
        except OSError:
            LOGGER.exception("[File Delete Failed] path=%s", path)
            return False

    def cleanup_old_files(self, max_age_hours: int = 1) -> int:
        """Remove files older than *max_age_hours* from the storage root.

        Args:
            max_age_hours: Maximum file age in hours before deletion.

        Returns:
            The number of files deleted.
        """
        cutoff = time.time() - (max_age_hours * 3600)
        deleted = 0
        try:
            for file_path in self.root.iterdir():
                if file_path.is_file() and file_path.stat().st_mtime < cutoff:
                    try:
                        file_path.unlink()
                        deleted += 1
                        LOGGER.debug("[Cleanup] deleted %s", file_path.name)
                    except OSError:
                        LOGGER.warning("[Cleanup] failed to delete %s", file_path.name)
        except OSError:
            LOGGER.exception("[Cleanup] error scanning storage directory")
        LOGGER.info("[Cleanup Complete] deleted=%d max_age_hours=%d", deleted, max_age_hours)
        return deleted
