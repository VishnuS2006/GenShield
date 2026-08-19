from sqlalchemy import Select, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_knowledge import CompanyKnowledgeRecord


class CompanyKnowledgeService:
    async def retrieve(self, db: AsyncSession, question: str, limit: int = 8) -> list[CompanyKnowledgeRecord]:
        result = await db.execute(
            text(
                """
                SELECT id
                FROM company_knowledge_records
                WHERE to_tsvector('english', searchable_text) @@ plainto_tsquery('english', :query)
                ORDER BY ts_rank_cd(to_tsvector('english', searchable_text), plainto_tsquery('english', :query)) DESC,
                         updated_at DESC
                LIMIT :limit
                """
            ),
            {"query": question, "limit": limit},
        )
        ids = [row[0] for row in result.fetchall()]
        if not ids:
            fallback: Select[tuple[CompanyKnowledgeRecord]] = (
                select(CompanyKnowledgeRecord).order_by(CompanyKnowledgeRecord.updated_at.desc()).limit(limit)
            )
            return list(await db.scalars(fallback))

        records = list(
            await db.scalars(select(CompanyKnowledgeRecord).where(CompanyKnowledgeRecord.id.in_(ids)))
        )
        order = {record_id: index for index, record_id in enumerate(ids)}
        records.sort(key=lambda item: order.get(item.id, len(order)))
        return records

    def render_context(self, records: list[CompanyKnowledgeRecord], max_chars: int = 5000) -> str:
        blocks: list[str] = []
        total = 0
        for record in records:
            block = (
                f"[{record.reference_id}] {record.title}\n"
                f"Business Unit: {record.business_unit}\n"
                f"Region: {record.region or 'Global'}\n"
                f"{record.content}"
            )
            if total + len(block) > max_chars and blocks:
                break
            blocks.append(block)
            total += len(block)
        return "\n\n".join(blocks)
