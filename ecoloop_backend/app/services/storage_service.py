import hashlib
import uuid
import filetype
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.verification_evidence import VerificationEvidence, EvidenceType
from app.models.user import User


class StorageError(Exception):
    pass


class StorageService:
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

    @staticmethod
    async def upload_verification_evidence(
        db: AsyncSession,
        file: UploadFile,
        uploaded_by_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
        evidence_type: EvidenceType
    ) -> VerificationEvidence:
        # Read contents
        contents = await file.read()
        file_size = len(contents)

        # 1. Size Validation
        if file_size > StorageService.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Fichier trop lourd. Limite fixée à 10 Mo.")

        # 2. MIME & Extension validation
        kind = filetype.guess(contents)
        if kind is None or kind.mime not in StorageService.ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Type MIME invalide. Seuls JPEG, PNG et WebP sont autorisés.")
        
        ext = kind.extension
        if ext not in StorageService.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Extension de fichier non autorisée.")

        # 3. Prevent duplicate photo reuse fraud (SHA-256 Check)
        sha256 = hashlib.sha256(contents).hexdigest()
        existing_evidence = await db.execute(
            select(VerificationEvidence).where(VerificationEvidence.file_hash == sha256)
        )
        if existing_evidence.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="Cette photo de preuve a déjà été utilisée (fraude détectée).")

        # 4. Simulate Upload to Cloudflare R2 / S3 (returns signed URL for dev)
        # In a real environment, we would do s3_client.put_object and get_presigned_url
        file_uuid = uuid.uuid4()
        simulated_url = f"https://r2.ecoloop.space/evidence/{file_uuid}.{ext}"

        # Create record
        evidence = VerificationEvidence(
            id=file_uuid,
            entity_type=entity_type,
            entity_id=entity_id,
            type=evidence_type,
            file_url=simulated_url,
            file_hash=sha256,
            uploaded_by_id=uploaded_by_id
        )
        db.add(evidence)
        await db.flush()

        return evidence
