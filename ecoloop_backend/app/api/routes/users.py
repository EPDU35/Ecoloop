from fastapi import APIRouter, Depends

from app.middlewares.jwt import get_current_user
from app.models.user import User
from app.schemas.user_schema import UserOutSchema

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.get("/me", response_model=UserOutSchema)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user
