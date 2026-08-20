import re
import uuid

DOMAIN_SYNONYMS = {
    "income": {"revenue", "financial", "finance", "earnings", "profit"},
    "revenue": {"income", "financial", "earnings", "sales"},
    "salary": {"compensation", "payroll", "bonus", "headcount", "retention"},
    "payroll": {"salary", "compensation", "bonus", "employee"},
    "product": {"roadmap", "launch", "initiative", "offering"},
    "roadmap": {"product", "launch", "initiative", "project"},
    "security": {"cybersecurity", "privileged", "vault", "access"},
    "legal": {"supplier", "patent", "settlement", "matter"},
    "strategy": {"priority", "expansion", "alliance", "bundle"},
}


def normalize_text(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9$.\s-]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value


def meaningful_tokens(value: str) -> set[str]:
    return {token for token in normalize_text(value).split() if len(token) > 2}


def expanded_meaningful_tokens(value: str) -> set[str]:
    tokens = meaningful_tokens(value)
    expanded = set(tokens)
    for token in tokens:
        expanded.update(DOMAIN_SYNONYMS.get(token, set()))
    return expanded


def new_request_id() -> str:
    return str(uuid.uuid4())
