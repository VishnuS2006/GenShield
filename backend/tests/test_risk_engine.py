from app.models.enums import Decision, SensitivityLevel
from app.services.risk_engine import RiskEngine


def test_allow_boundary():
    score, _, decision = RiskEngine().calculate(0.4, 0.3, SensitivityLevel.LOW)
    assert score <= 59
    assert decision == Decision.ALLOW


def test_warn_boundary():
    score, _, decision = RiskEngine().calculate(0.8, 0.5, SensitivityLevel.MEDIUM)
    assert 60 <= score <= 89
    assert decision == Decision.WARN


def test_block_boundary():
    score, _, decision = RiskEngine().calculate(1.0, 1.0, SensitivityLevel.CRITICAL)
    assert score >= 90
    assert decision == Decision.BLOCK


def test_score_clamping():
    score, _, _ = RiskEngine().calculate(10, 10, SensitivityLevel.CRITICAL)
    assert score == 100
