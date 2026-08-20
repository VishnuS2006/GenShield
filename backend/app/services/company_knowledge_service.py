from sqlalchemy import Select, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_knowledge import CompanyKnowledgeRecord
from app.utils.helpers import expanded_meaningful_tokens, meaningful_tokens


class CompanyKnowledgeService:
    TOPIC_REFERENCE_IDS = {
        "overview": ["AK-FOUND-001"],
        "business_areas": ["AK-FOUND-002"],
        "products": ["AK-FOUND-003"],
        "markets": ["AK-FOUND-004"],
        "performance": ["AK-FOUND-001", "AK-FOUND-002", "AK-FOUND-003", "AK-FOUND-004"],
    }

    def _detect_broad_query_topics(self, question: str) -> list[str]:
        lowered = question.lower()
        topics: list[str] = []
        if any(phrase in lowered for phrase in ["overview of our company", "overview of the company", "about our company", "company overview"]):
            topics.append("overview")
        if any(phrase in lowered for phrase in ["main business areas", "business areas", "business units", "operating model"]):
            topics.append("business_areas")
        if any(phrase in lowered for phrase in ["products", "product portfolio", "product offerings"]):
            topics.append("products")
        if any(phrase in lowered for phrase in ["markets", "customers", "industries", "operate in"]):
            topics.append("markets")
        if any(phrase in lowered for phrase in ["business performance", "performance summary", "current performance", "strategic priorities", "summarize"]):
            topics.append("performance")
        return topics

    async def retrieve(self, db: AsyncSession, question: str, limit: int = 40) -> list[CompanyKnowledgeRecord]:
        query_tokens = expanded_meaningful_tokens(question)
        broad_topics = self._detect_broad_query_topics(question)
        all_records = list(await db.scalars(select(CompanyKnowledgeRecord).order_by(CompanyKnowledgeRecord.updated_at.desc())))
        if broad_topics:
            reference_ids: list[str] = []
            for topic in broad_topics:
                reference_ids.extend(self.TOPIC_REFERENCE_IDS.get(topic, []))
            topic_records = [record for record in all_records if record.reference_id in reference_ids]
            if topic_records:
                ordering = {reference_id: index for index, reference_id in enumerate(reference_ids)}
                topic_records.sort(key=lambda item: ordering.get(item.reference_id, len(ordering)))
                remaining = [record for record in all_records if record.reference_id not in reference_ids]
                return (topic_records + remaining)[:limit]
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
        records: list[CompanyKnowledgeRecord] = []
        if ids:
            records = list(
                await db.scalars(select(CompanyKnowledgeRecord).where(CompanyKnowledgeRecord.id.in_(ids)))
            )
            order = {record_id: index for index, record_id in enumerate(ids)}
            records.sort(key=lambda item: order.get(item.id, len(order)))
            if records:
                return records[:limit]

        # Deterministic lexical fallback: do not return arbitrary latest records.
        scored: list[tuple[int, int, CompanyKnowledgeRecord]] = []
        for record in all_records:
            record_tokens = expanded_meaningful_tokens(record.searchable_text)
            overlap = query_tokens & record_tokens
            if len(overlap) >= 2:
                scored.append((len(overlap), len(record_tokens), record))

        scored.sort(key=lambda item: (item[0], -item[1]), reverse=True)
        return [record for _, _, record in scored[:limit]]

    def render_context(self, records: list[CompanyKnowledgeRecord], max_chars: int = 50000) -> str:
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
