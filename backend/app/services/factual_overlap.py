from app.models.protected_document import ProtectedDocument
from app.utils.helpers import normalize_text


class FactualOverlapService:
    def analyze(self, text: str, documents: list[ProtectedDocument]) -> dict:
        normalized = normalize_text(text)
        best_result = {
            "facts_matched": 0,
            "facts_total": 0,
            "overlap_score": 0.0,
            "matched_facts": [],
        }
        for document in documents:
            matched_facts: list[str] = []
            matched_weight = 0
            total_weight = 0
            for fact in document.facts:
                total_weight += fact.importance
                candidate = normalize_text(fact.fact_value)
                if candidate and candidate in normalized:
                    matched_weight += fact.importance
                    matched_facts.append(f"{fact.fact_type}: {fact.fact_value}")
            overlap_score = matched_weight / total_weight if total_weight else 0.0
            current = {
                "facts_matched": len(matched_facts),
                "facts_total": len(document.facts),
                "overlap_score": round(overlap_score, 4),
                "matched_facts": matched_facts,
            }
            if (
                current["overlap_score"] > best_result["overlap_score"]
                or (
                    current["overlap_score"] == best_result["overlap_score"]
                    and current["facts_matched"] > best_result["facts_matched"]
                )
            ):
                best_result = current
        return best_result
