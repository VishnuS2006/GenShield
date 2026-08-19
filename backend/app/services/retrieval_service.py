from dataclasses import dataclass

from app.models.protected_document import ProtectedDocument
from app.utils.helpers import meaningful_tokens


@dataclass
class RetrievalMatch:
    document: ProtectedDocument
    relevant_facts: list
    relevance_score: float


class RetrievalService:
    def retrieve(self, prompt: str, documents: list[ProtectedDocument], limit: int = 3) -> list[RetrievalMatch]:
        prompt_tokens = meaningful_tokens(prompt)
        matches: list[RetrievalMatch] = []
        for document in documents:
            doc_tokens = meaningful_tokens(f"{document.title} {document.department} {document.content}")
            fact_tokens = set()
            relevant_facts = []
            for fact in document.facts:
                tokens = meaningful_tokens(f"{fact.fact_type} {fact.fact_value}")
                fact_tokens |= tokens
                if prompt_tokens & tokens:
                    relevant_facts.append(fact)

            overlap = len(prompt_tokens & (doc_tokens | fact_tokens))
            score = overlap / max(len(prompt_tokens) or 1, 1)
            if overlap or not matches:
                matches.append(RetrievalMatch(document=document, relevant_facts=relevant_facts or document.facts[:3], relevance_score=score))

        matches.sort(key=lambda item: item.relevance_score, reverse=True)
        return matches[:limit]
