from app.models.protected_document import ProtectedDocument
from app.models.protected_fact import ProtectedFact
from app.services.factual_overlap import FactualOverlapService


def build_doc():
    doc = ProtectedDocument(title="Doc", department="Product", content="Project Orion enterprise launch", sensitivity="HIGH", lineage_tag="X")
    doc.facts = [
        ProtectedFact(fact_type="project", fact_value="Orion", importance=3),
        ProtectedFact(fact_type="market", fact_value="Enterprise", importance=2),
        ProtectedFact(fact_type="launch", fact_value="October 2026", importance=4),
    ]
    return doc


def test_zero_facts():
    result = FactualOverlapService().analyze("Nothing relevant here", [build_doc()])
    assert result["facts_matched"] == 0


def test_one_fact():
    result = FactualOverlapService().analyze("Orion is mentioned", [build_doc()])
    assert result["facts_matched"] == 1


def test_all_facts():
    result = FactualOverlapService().analyze("Orion for enterprise launches in October 2026", [build_doc()])
    assert result["facts_matched"] == 3


def test_normalized_matching():
    result = FactualOverlapService().analyze("orion, for ENTERPRISE users, launches in october 2026.", [build_doc()])
    assert result["facts_matched"] == 3
