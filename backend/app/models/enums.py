import enum


class SensitivityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Decision(str, enum.Enum):
    ALLOW = "ALLOW"
    WARN = "WARN"
    BLOCK = "BLOCK"


class UserRole(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    ADMINISTRATOR = "ADMINISTRATOR"


class MessageRole(str, enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"
