import io
import uuid
import logging

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
from app.services.ai_service import ai_service

router = APIRouter(tags=["Déchets"])
logger = logging.getLogger("ecoloop.wastes")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

# Mapping des 8 classes IA (ecoloop_ai/models/waste_classifier/model.py)
# vers les 7 valeurs de WasteCategory (app/models/waste.py).
AI_CATEGORY_TO_WASTE = {
    "plastique": WasteCategory.PLASTIQUE,
    "metal": WasteCategory.METAL,
    "verre": WasteCategory.VERRE,
    "papier": WasteCategory.CARTON,      # pas d'enum PAPIER -> carton
    "organique": WasteCategory.ORGANIQUE,
    "dangereux": WasteCategory.AUTRE,    # pas d'enum dédié ; batteries -> AUTRE
    "residuel": WasteCategory.AUTRE,
    "autre": WasteCategory.AUTRE,
}

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
    current_user: User = Depends(get_current_verified_user),
):
    return await waste_controller.list_my_wastes(db, current_user, limit=100, offset=0)


@router.get("/available-wastes", response_model=list[WasteLotOutSchema])
async def available_wastes(
    category: WasteCategory | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    collector: User = Depends(require_roles(UserRole.COLLECTEUR)),
):
    return await waste_controller.list_available_wastes(db, category.value if category else None, limit, offset)


@router.get("/price-suggestion")
async def price_suggestion(
    category: WasteCategory,
    _: User = Depends(get_current_verified_user),
):
    """Get AI-suggested price per kg for a waste category."""
    try:
        result = await ai_service.predict_price(category.value.lower(), periods=1)
        predictions = result.get("predictions", [])
        if predictions:
            suggested_price = predictions[0].get("price", 0)
            return {
                "category": category.value,
                "suggested_price_per_kg": round(suggested_price, 2),
                "source": "ai",
            }
    except Exception:
        pass

    fallback_prices = {
        "PLASTIQUE": 150, "CARTON": 80, "METAL": 300,
        "VERRE": 50, "ORGANIQUE": 30, "ELECTRONIQUE": 500, "AUTRE": 100,
    }
    return {
        "category": category.value,
        "suggested_price_per_kg": fallback_prices.get(category.value, 100),
        "source": "fallback",
    }


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
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Échec de l'envoi de l'image, réessayez.")

    photo_url = upload_result["secure_url"]
    updated_lot = await waste_controller.attach_photo_url(db, lot, current_user, photo_url)
    await db.commit()

    # AI classification sur photo uploadée — persiste la catégorie détectée
    try:
        classify_file = UploadFile(
            filename=file.filename or "upload",
            file=io.BytesIO(contents),
            content_type=file.content_type or "image/jpeg",
        )
        classify_result = await ai_service.classify_image(classify_file)
        type_dominant = (classify_result or {}).get("type_dominant")
        if type_dominant and type_dominant in AI_CATEGORY_TO_WASTE:
            detected = AI_CATEGORY_TO_WASTE[type_dominant]
            # On n'écrase que si la catégorie n'a pas été fixée explicitement
            # par le producteur (AUTRE = non renseignée).
            if lot.category == WasteCategory.AUTRE:
                updated_lot = await waste_controller.attach_ai_category(
                    db, lot, current_user, detected
                )
                await db.commit()
            logger.info("AI classify lot %s -> %s", lot.id, detected.value)
    except Exception as exc:
        logger.warning("AI classification failed for lot %s: %s", lot.id, exc)

    return updated_lot
