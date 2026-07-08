import uuid

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.controllers import waste_controller
from app.middlewares.jwt import get_current_verified_user
from app.middlewares.roles import require_roles
from app.models.user import User, UserRole
from app.models.waste import WasteCategory
from app.schemas.waste_schema import WasteLotCreateSchema, WasteLotOutSchema, WasteLotUpdateSchema
from app.services.matching_service import notify_nearby_collectors

router = APIRouter(tags=["Déchets"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 Mo

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


@router.post("/wastes", response_model=WasteLotOutSchema, status_code=status.HTTP_201_CREATED)
async def create_lot(
    payload: WasteLotCreateSchema,
    db: AsyncSession = Depends(get_db),
    producer: User = Depends(require_roles(UserRole.PRODUCTEUR)),
):
    lot = await waste_controller.create_waste_lot(db, producer, payload)
    await db.commit()
    await notify_nearby_collectors(db, lot)
    return lot


@router.get("/my-wastes", response_model=list[WasteLotOutSchema])
async def my_wastes(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    producer: User = Depends(require_roles(UserRole.PRODUCTEUR)),
):
    return await waste_controller.list_my_wastes(db, producer, limit, offset)


@router.get("/history", response_model=list[WasteLotOutSchema])
async def my_history(
    db: AsyncSession = Depends(get_db),
    producer: User = Depends(require_roles(UserRole.PRODUCTEUR)),
):
    return await waste_controller.list_my_wastes(db, producer, limit=100, offset=0)


@router.get("/available-wastes", response_model=list[WasteLotOutSchema])
async def available_wastes(
    category: WasteCategory | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    collector: User = Depends(require_roles(UserRole.COLLECTEUR)),
):
    return await waste_controller.list_available_wastes(db, category.value if category else None, limit, offset)


@router.patch("/wastes/{lot_id}", response_model=WasteLotOutSchema)
async def update_lot(
    lot_id: uuid.UUID,
    payload: WasteLotUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user),
):
    lot = await waste_controller.get_lot_or_404(db, lot_id)
    updated = await waste_controller.update_waste_lot(db, lot, current_user, payload)
    await db.commit()
    return updated


@router.delete("/wastes/{lot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lot(
    lot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user),
):
    lot = await waste_controller.get_lot_or_404(db, lot_id)
    await waste_controller.delete_waste_lot(db, lot, current_user)
    await db.commit()


@router.post("/wastes/{lot_id}/photo", response_model=WasteLotOutSchema)
async def upload_lot_photo(
    lot_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Format d'image non autorisé (jpeg, png, webp uniquement).",
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image trop volumineuse (5 Mo max).")

    lot = await waste_controller.get_lot_or_404(db, lot_id)
    waste_controller.ensure_owner(lot, current_user)

    try:
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="ecoloop/wastes",
            resource_type="image",
            public_id=str(lot.id),
            overwrite=True,
        )
    except Exception:
        # On ne renvoie jamais le détail de l'erreur du fournisseur externe au client.
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Échec de l'envoi de l'image, réessayez.")

    updated_lot = await waste_controller.attach_photo_url(db, lot, current_user, upload_result["secure_url"])
    await db.commit()
    return updated_lot
