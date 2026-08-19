import re
import uuid


def normalize_text(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9$.\s-]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value


def meaningful_tokens(value: str) -> set[str]:
    return {token for token in normalize_text(value).split() if len(token) > 2}


def new_request_id() -> str:
    return str(uuid.uuid4())
