from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.controllers import payment_controller
from app.middlewares.jwt import get_current_verified_user
from app.models.user import User
from app.schemas.transaction_schema import TransactionCreateSchema, TransactionOutSchema

router = APIRouter(prefix="/transaction", tags=["Transactions"])


@router.post("/create", response_model=TransactionOutSchema, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user),
):
    transaction = await payment_controller.create_transaction(db, current_user, payload)
    await db.commit()
    return transaction


@router.get("/history", response_model=list[TransactionOutSchema])
async def transaction_history(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_verified_user),
):
    return await payment_controller.list_transaction_history(db, current_user, limit, offset)
