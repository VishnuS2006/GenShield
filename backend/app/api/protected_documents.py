from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.enums import UserRole
from app.models.protected_document import ProtectedDocument
from app.models.protected_fact import ProtectedFact
from app.models.user import User
from app.schemas.protected_document import (
    ProtectedDocumentCreate,
    ProtectedDocumentRead,
    ProtectedDocumentUpdate,
)
from app.services.embedding_service import get_embedding_service

router = APIRouter(prefix="/api/protected-documents", tags=["protected-documents"])


@router.get("", response_model=list[ProtectedDocumentRead])
async def list_documents(
    _: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db)
) -> list[ProtectedDocument]:
    result = await db.scalars(select(ProtectedDocument).options(selectinload(ProtectedDocument.facts)))
    return list(result)


@router.get("/{document_id}", response_model=ProtectedDocumentRead)
async def get_document(
    document_id: int,
    _: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db)
) -> ProtectedDocument:
    document = await db.scalar(
        select(ProtectedDocument).options(selectinload(ProtectedDocument.facts)).where(ProtectedDocument.id == document_id)
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document


@router.post("", response_model=ProtectedDocumentRead, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: ProtectedDocumentCreate,
    _: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
) -> ProtectedDocument:
    document = ProtectedDocument(
        title=payload.title,
        department=payload.department,
        content=payload.content,
        sensitivity=payload.sensitivity,
        lineage_tag=payload.lineage_tag,
    )
    document.facts = [ProtectedFact(**fact.model_dump()) for fact in payload.facts]
    db.add(document)
    await db.commit()
    await db.refresh(document)
    get_embedding_service().refresh_cache()
    return await get_document(document.id, _, db)


@router.put("/{document_id}", response_model=ProtectedDocumentRead)
async def update_document(
    document_id: int,
    payload: ProtectedDocumentUpdate,
    _: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db),
) -> ProtectedDocument:
    document = await db.scalar(
        select(ProtectedDocument).options(selectinload(ProtectedDocument.facts)).where(ProtectedDocument.id == document_id)
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    for key, value in payload.model_dump(exclude_unset=True, exclude={"facts"}).items():
        setattr(document, key, value)
    if payload.facts is not None:
        document.facts = [ProtectedFact(**fact.model_dump()) for fact in payload.facts]
    await db.commit()
    get_embedding_service().refresh_cache()
    return await get_document(document.id, _, db)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    _: User = Depends(require_roles(UserRole.SECURITY_ANALYST, UserRole.ADMINISTRATOR)),
    db: AsyncSession = Depends(get_db)
) -> None:
    document = await db.get(ProtectedDocument, document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    await db.delete(document)
    await db.commit()
    get_embedding_service().refresh_cache()
