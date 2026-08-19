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
    def calculate(self, similarity: float, factual_overlap: float, sensitivity: SensitivityLevel | None) -> tuple[int, int, Decision]:
        sensitivity_score = SENSITIVITY_SCORES.get(sensitivity, 0)
        score = (similarity * 45) + (factual_overlap * 30) + ((sensitivity_score / 100) * 25)
        if factual_overlap >= 0.5 and similarity >= 0.2:
            score += 10
        elif factual_overlap >= 0.5:
            score += 5
        score = round(score)
        score = max(0, min(100, score))
        if score >= settings.risk_block_threshold:
            decision = Decision.BLOCK
        elif score >= settings.risk_warn_threshold:
            decision = Decision.WARN
        else:
            decision = Decision.ALLOW
        return score, sensitivity_score, decision
