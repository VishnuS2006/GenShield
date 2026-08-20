from dataclasses import dataclass

from app.models.enums import Decision, SensitivityLevel
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
    risk_level: str
    decision: str


class DetectionService:
    def __init__(self) -> None:
        self.embedding_service = get_embedding_service()
        self.factual_service = FactualOverlapService()
        self.risk_engine = RiskEngine()

    def _request_intent_score(self, prompt: str) -> float:
        lowered = prompt.lower()
        score = 0.0
        phrases = {
            "exact": 0.2,
            "confidential": 0.35,
            "what confidential information": 0.45,
            "internal": 0.2,
            "forecast": 0.35,
            "revenue target": 0.35,
            "financial forecast": 0.45,
            "launch date": 0.25,
            "unreleased": 0.35,
            "vulnerabilities": 0.45,
            "what internal cybersecurity vulnerabilities": 0.5,
            "legal settlement": 0.35,
            "acquisition strategy": 0.45,
            "strategic decisions": 0.35,
        }
        for phrase, weight in phrases.items():
            if phrase in lowered:
                score += weight
        return min(score, 1.0)

    def _target_department_bonus(self, prompt: str, document: ProtectedDocument) -> float:
        lowered = prompt.lower()
        department = document.department.lower()
        routing = {
            "finance": ["forecast", "financial", "revenue", "margin", "income", "quarter"],
            "security": ["vulnerability", "vulnerabilities", "security", "cybersecurity", "access", "internal"],
            "strategy": ["strategy", "strategic", "acquisition", "management", "roadmap"],
            "legal": ["legal", "settlement", "patent", "dispute"],
            "product": ["product", "launch", "orion", "unreleased"],
            "human resources": ["hr", "hiring", "salary", "retention", "bonus"],
        }
        for target_department, keywords in routing.items():
            if department == target_department and any(keyword in lowered for keyword in keywords):
                return 0.35
        return 0.0

    def _document_match_score(self, prompt: str, generated_response: str, document: ProtectedDocument) -> float:
        prompt_score = self.embedding_service.similarity(prompt, f"{document.title} {document.content}")
        response_score = self.embedding_service.similarity(generated_response, document.content)
        facts_score = 0.0
        exact_match_bonus = 0.0
        if document.facts:
            fact_blob = " ".join(f"{fact.fact_type} {fact.fact_value}" for fact in document.facts)
            facts_score = self.embedding_service.similarity(prompt, fact_blob)
            lowered_prompt = prompt.lower()
            for fact in document.facts:
                value = fact.fact_value.lower()
                if len(value) >= 4 and value in lowered_prompt:
                    exact_match_bonus += min(0.12, fact.importance / 50)
        title = document.title.lower()
        if len(title) >= 4 and title in prompt.lower():
            exact_match_bonus += 0.18
        return min(
            1.0,
            max(prompt_score, response_score, facts_score)
            + self._target_department_bonus(prompt, document)
            + min(exact_match_bonus, 0.35),
        )

    def analyze(
        self,
        generated_response: str,
        documents: list[ProtectedDocument],
        prompt: str = "",
    ) -> DetectionOutcome:
        best_document = None
        best_similarity = 0.0
        protected_match_score = 0.0
        for document in documents:
            response_score = self.embedding_service.similarity(generated_response, document.content)
            match_score = self._document_match_score(prompt, generated_response, document)
            if match_score > protected_match_score:
                protected_match_score = match_score
                best_document = document
            if response_score > best_similarity:
                best_similarity = response_score

        factual = self.factual_service.analyze(generated_response, documents)
        sensitivity = best_document.sensitivity if best_document else None
        request_intent_score = self._request_intent_score(prompt)
        risk_score, sensitivity_score, decision = self.risk_engine.calculate(
            best_similarity,
            factual["overlap_score"],
            sensitivity,
            request_intent_score=request_intent_score,
            protected_match_score=protected_match_score,
        )
        if (
            best_document
            and request_intent_score >= 0.8
            and protected_match_score >= 0.45
            and best_document.sensitivity in {SensitivityLevel.HIGH, SensitivityLevel.CRITICAL}
        ):
            risk_score = max(risk_score, 90 if best_document.sensitivity == SensitivityLevel.HIGH else 96)
            decision = Decision.BLOCK
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
            risk_level=self.risk_engine.classify_risk_level(risk_score),
            decision=decision.value,
        )
