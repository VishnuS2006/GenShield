from dataclasses import dataclass

from app.models.protected_document import ProtectedDocument
from app.services.embedding_service import get_embedding_service
from app.utils.helpers import expanded_meaningful_tokens, meaningful_tokens


@dataclass
class RetrievalMatch:
    document: ProtectedDocument
    relevant_facts: list
    relevance_score: float


class RetrievalService:
    def __init__(self) -> None:
        self.embedding_service = get_embedding_service()

    def _exact_match_bonus(self, prompt: str, candidates: list[str]) -> float:
        lowered_prompt = prompt.lower()
        bonus = 0.0
        for candidate in candidates:
            normalized = candidate.strip().lower()
            if len(normalized) >= 4 and normalized in lowered_prompt:
                bonus += 0.2
        return min(bonus, 0.6)

    def retrieve(self, prompt: str, documents: list[ProtectedDocument], limit: int = 3) -> list[RetrievalMatch]:
        prompt_tokens = expanded_meaningful_tokens(prompt)
        matches: list[RetrievalMatch] = []
        for document in documents:
            doc_tokens = expanded_meaningful_tokens(f"{document.title} {document.department} {document.content}")
            fact_tokens = set()
            relevant_facts = []
            fact_values: list[str] = []
            for fact in document.facts:
                tokens = expanded_meaningful_tokens(f"{fact.fact_type} {fact.fact_value}")
                fact_tokens |= tokens
                fact_values.append(fact.fact_value)
                if prompt_tokens & tokens:
                    relevant_facts.append(fact)

            overlap = len(prompt_tokens & (doc_tokens | fact_tokens))
            lexical_score = overlap / max(len(prompt_tokens) or 1, 1)
            semantic_score = self.embedding_service.similarity(
                prompt,
                f"{document.title} {document.department} {document.content}",
            )
            exact_match_bonus = self._exact_match_bonus(prompt, [document.title, document.department, *fact_values])
            score = min(1.0, (lexical_score * 0.45) + (semantic_score * 0.4) + exact_match_bonus)
            if overlap > 0:
                matches.append(RetrievalMatch(document=document, relevant_facts=relevant_facts or document.facts[:3], relevance_score=score))

        matches.sort(key=lambda item: item.relevance_score, reverse=True)
        return matches[:limit]
