from app.core.config import get_settings
from app.models.enums import Decision, SensitivityLevel

settings = get_settings()

SENSITIVITY_SCORES = {
    SensitivityLevel.LOW: 20,
    SensitivityLevel.MEDIUM: 45,
    SensitivityLevel.HIGH: 75,
    SensitivityLevel.CRITICAL: 100,
}


class RiskEngine:
    @staticmethod
    def classify_risk_level(score: int) -> str:
        if score >= 85:
            return "HIGH"
        if score >= 45:
            return "MEDIUM"
        return "LOW"

    def calculate(
        self,
        similarity: float,
        factual_overlap: float,
        sensitivity: SensitivityLevel | None,
        request_intent_score: float = 0.0,
        protected_match_score: float = 0.0,
    ) -> tuple[int, int, Decision]:
        sensitivity_score = SENSITIVITY_SCORES.get(sensitivity, 0)
        score = (
            (similarity * 35)
            + (factual_overlap * 25)
            + ((sensitivity_score / 100) * 20)
            + (request_intent_score * 10)
            + (protected_match_score * 10)
        )
        if factual_overlap >= 0.5 and similarity >= 0.2:
            score += 10
        elif factual_overlap >= 0.5:
            score += 5
        if sensitivity in {SensitivityLevel.HIGH, SensitivityLevel.CRITICAL} and request_intent_score >= 0.75:
            score += 12
        if sensitivity == SensitivityLevel.CRITICAL and protected_match_score >= 0.55:
            score += 8
        score = round(score)
        score = max(0, min(100, score))
        if score >= settings.risk_block_threshold:
            decision = Decision.BLOCK
        elif score >= settings.risk_warn_threshold:
            decision = Decision.WARN
        else:
            decision = Decision.ALLOW
        return score, sensitivity_score, decision
