from dataclasses import dataclass

from app.models.enums import SensitivityLevel
from app.models.protected_document import ProtectedDocument
from app.services.embedding_service import get_embedding_service
from app.services.factual_overlap import FactualOverlapService
from app.services.risk_engine import RiskEngine


@dataclass
class DetectionOutcome:
    similarity_score: float
    factual_overlap_score: float
    facts_matched: int
    facts_total: int
    matched_facts: list[str]
    matched_document: ProtectedDocument | None
    sensitivity: SensitivityLevel | None
    sensitivity_score: int
    risk_score: int
    decision: str


class DetectionService:
    def __init__(self) -> None:
        self.embedding_service = get_embedding_service()
        self.factual_service = FactualOverlapService()
        self.risk_engine = RiskEngine()

    def analyze(self, generated_response: str, documents: list[ProtectedDocument]) -> DetectionOutcome:
        best_document = None
        best_similarity = 0.0
        for document in documents:
            score = self.embedding_service.similarity(generated_response, document.content)
            if score > best_similarity:
                best_similarity = score
                best_document = document

        factual = self.factual_service.analyze(generated_response, documents)
        sensitivity = best_document.sensitivity if best_document else None
        risk_score, sensitivity_score, decision = self.risk_engine.calculate(
            best_similarity,
            factual["overlap_score"],
            sensitivity,
        )
        return DetectionOutcome(
            similarity_score=round(best_similarity, 4),
            factual_overlap_score=factual["overlap_score"],
            facts_matched=factual["facts_matched"],
            facts_total=factual["facts_total"],
            matched_facts=factual["matched_facts"],
            matched_document=best_document,
            sensitivity=sensitivity,
            sensitivity_score=sensitivity_score,
            risk_score=risk_score,
            decision=decision.value,
        )
