from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.audit_log import AuditLog
from app.models.detection_result import DetectionResult
from app.models.user import User
from app.schemas.auth import (
    DetectionSettingsRead,
    SettingsRead,
    TokenResponse,
    UserLogin,
    UserProfileSummary,
    UserRead,
    UserRegister,
)
from app.core.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> User:
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(email=payload.email, password_hash=get_password_hash(payload.password), full_name=payload.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/profile-summary", response_model=UserProfileSummary)
async def profile_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProfileSummary:
    request_count = await db.scalar(select(func.count(AuditLog.id)).where(AuditLog.user_id == user.id)) or 0
    detection_count = (
        await db.scalar(
            select(func.count(DetectionResult.id))
            .select_from(DetectionResult)
            .join(AuditLog, AuditLog.request_id == DetectionResult.request_id)
            .where(AuditLog.user_id == user.id)
        )
    ) or 0
    last_activity_at = await db.scalar(
        select(func.max(AuditLog.created_at)).where(AuditLog.user_id == user.id)
    )
    return UserProfileSummary(
        user=user,
        request_count=request_count,
        detection_count=detection_count,
        last_activity_at=last_activity_at,
    )


@router.get("/settings", response_model=SettingsRead)
async def get_settings_view(user: User = Depends(get_current_user)) -> SettingsRead:
    return SettingsRead(
        account=user,
        security={
            "session_auth": f"JWT Bearer ({settings.jwt_algorithm})",
            "password_hashing": "Argon2",
            "logout_behavior": "Client token invalidation",
        },
        detection=DetectionSettingsRead(
            similarity_warn_threshold=settings.similarity_warn_threshold,
            similarity_block_threshold=settings.similarity_block_threshold,
            risk_warn_threshold=settings.risk_warn_threshold,
            risk_block_threshold=settings.risk_block_threshold,
            factual_overlap_mode="deterministic protected fact matching",
            embedding_model=settings.embedding_model,
        ),
    )
