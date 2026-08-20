from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_knowledge import CompanyKnowledgeRecord
from app.models.enums import SensitivityLevel
from app.models.protected_document import ProtectedDocument
from app.models.protected_fact import ProtectedFact
from app.seed.company_knowledge import seed_company_knowledge

SEED_DOCUMENTS = [
    {
        "title": "Financial Intelligence",
        "department": "Finance",
        "sensitivity": SensitivityLevel.CRITICAL,
        "lineage_tag": "CONF-FINANCE-001",
        "content": "NovaTech Industries expects Atlas Cloud revenue of $128.4M in FY2027 with margin expansion to 31 percent after the Helios acquisition integration.",
        "facts": [("revenue_forecast", "$128.4M", 5), ("fiscal_year", "FY2027", 3), ("margin_target", "31 percent", 4), ("initiative", "Helios acquisition integration", 4), ("product", "Atlas Cloud", 4)],
    },
    {
        "title": "Executive Strategy",
        "department": "Strategy",
        "sensitivity": SensitivityLevel.HIGH,
        "lineage_tag": "CONF-STRATEGY-001",
        "content": "NovaTech will prioritize North America and DACH expansion, bundle Atlas Cloud with SentinelOps, and pursue two telecom channel alliances in Q1 2027.",
        "facts": [("region", "North America", 3), ("region", "DACH", 3), ("bundle", "Atlas Cloud with SentinelOps", 4), ("alliances", "two telecom channel alliances", 4), ("timeline", "Q1 2027", 3)],
    },
    {
        "title": "Product Roadmap",
        "department": "Product",
        "sensitivity": SensitivityLevel.HIGH,
        "lineage_tag": "CONF-PRODUCT-001",
        "content": "Project Orion targets enterprise customers, launches in October 2026, and is projected to generate $84.5M by pairing governance automation with secure workflow copilots.",
        "facts": [("project", "Orion", 5), ("market", "Enterprise", 4), ("launch_date", "October 2026", 5), ("revenue_forecast", "$84.5M", 4), ("capability", "governance automation", 3), ("capability", "secure workflow copilots", 3)],
    },
    {
        "title": "Cybersecurity Operations",
        "department": "Security",
        "sensitivity": SensitivityLevel.CRITICAL,
        "lineage_tag": "CONF-SECURITY-001",
        "content": "The RavenShield program rotates privileged access every 12 hours, stores break-glass keys in Vault Delta, and begins purple-team validation on September 15 2026.",
        "facts": [("program", "RavenShield", 5), ("rotation_window", "12 hours", 4), ("vault", "Vault Delta", 5), ("exercise_date", "September 15 2026", 4), ("practice", "purple-team validation", 3)],
    },
    {
        "title": "HR Leadership Plan",
        "department": "Human Resources",
        "sensitivity": SensitivityLevel.MEDIUM,
        "lineage_tag": "CONF-HR-001",
        "content": "NovaTech plans a 7 percent retention bonus for senior platform engineers, a hiring target of 42 specialists, and a Bengaluru leadership summit in November 2026.",
        "facts": [("bonus", "7 percent retention bonus", 3), ("headcount", "42 specialists", 4), ("location", "Bengaluru", 2), ("event", "leadership summit", 2), ("timeline", "November 2026", 2)],
    },
    {
        "title": "Legal Risk Register",
        "department": "Legal",
        "sensitivity": SensitivityLevel.HIGH,
        "lineage_tag": "CONF-LEGAL-001",
        "content": "The company is preparing the Aurora IP defense package, extending the LumaGrid supplier settlement window to December 12 2026, and ring-fencing three disputed patent families.",
        "facts": [("matter", "Aurora IP defense package", 4), ("supplier", "LumaGrid", 3), ("deadline", "December 12 2026", 4), ("patents", "three disputed patent families", 4), ("action", "ring-fencing", 2)],
    },
]


async def seed_synthetic_data(db: AsyncSession) -> None:
    existing = await db.scalar(select(ProtectedDocument.id).limit(1))
    if not existing:
        for item in SEED_DOCUMENTS:
            document = ProtectedDocument(
                title=item["title"],
                department=item["department"],
                content=item["content"],
                sensitivity=item["sensitivity"],
                lineage_tag=item["lineage_tag"],
            )
            document.facts = [
                ProtectedFact(fact_type=fact_type, fact_value=fact_value, importance=importance)
                for fact_type, fact_value, importance in item["facts"]
            ]
            db.add(document)
        await db.commit()

    await seed_company_knowledge(db)
