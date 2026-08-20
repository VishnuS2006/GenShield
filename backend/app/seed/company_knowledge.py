from __future__ import annotations

import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_knowledge import CompanyKnowledgeRecord

COMPANY_NAME = "Aurelia Systems"
BUSINESS_UNITS = [
    "Enterprise Analytics",
    "Cloud Operations",
    "Customer Success",
    "Cyber Defense",
    "Revenue Operations",
    "Platform Engineering",
]
REGIONS = ["North America", "DACH", "United Kingdom", "India", "Singapore", "Latin America"]
PRODUCTS = [
    "Orion Analytics",
    "Atlas Cloud",
    "SentinelOps",
    "Nimbus Flow",
    "Helix Assist",
    "Aegis Monitor",
]
CUSTOMERS = [
    "Helio Freight Group",
    "Northstar Health Network",
    "Cobalt Retail Partners",
    "Meridian Mobility Works",
    "Silverline Energy Services",
    "BlueHarbor Capital Advisers",
]
PROJECTS = [
    "Project Aurora",
    "Project Orion",
    "Project Helix",
    "Project Compass",
    "Project Horizon",
    "Project Vantage",
]
METRICS = ["pipeline growth", "renewal rate", "gross margin", "deployment velocity", "support resolution time"]

FOUNDATIONAL_RECORDS = [
    {
        "reference_id": "AK-FOUND-001",
        "record_type": "company_overview",
        "title": f"{COMPANY_NAME} company overview",
        "content": (
            f"{COMPANY_NAME} is an enterprise software and services company focused on analytics, cloud operations, "
            "AI-enabled workflow automation, cybersecurity resilience, customer success operations, and platform engineering. "
            "The company serves regulated and operations-heavy industries that need secure, high-availability digital platforms."
        ),
        "business_unit": "Corporate Strategy",
        "region": "Global",
        "searchable_text": (
            f"{COMPANY_NAME} company overview business areas main business areas enterprise software analytics cloud operations "
            "workflow automation cybersecurity customer success platform engineering regulated industries"
        ),
        "record_metadata": {
            "company": COMPANY_NAME,
            "topic": "overview",
            "priority": "foundational",
        },
    },
    {
        "reference_id": "AK-FOUND-002",
        "record_type": "business_areas",
        "title": "Primary business areas and operating model",
        "content": (
            "The company operates across six primary business areas: Enterprise Analytics, Cloud Operations, Cyber Defense, "
            "Revenue Operations, Customer Success, and Platform Engineering. These areas work together to deliver software products, "
            "managed services, deployment programs, operational intelligence, and secure AI adoption support."
        ),
        "business_unit": "Corporate Strategy",
        "region": "Global",
        "searchable_text": (
            "primary business areas operating model main business areas enterprise analytics cloud operations cyber defense "
            "revenue operations customer success platform engineering software products managed services secure AI adoption"
        ),
        "record_metadata": {
            "company": COMPANY_NAME,
            "topic": "business_areas",
            "priority": "foundational",
        },
    },
    {
        "reference_id": "AK-FOUND-003",
        "record_type": "product_portfolio",
        "title": "Core product portfolio summary",
        "content": (
            "The company product portfolio is anchored by Orion Analytics, Atlas Cloud, SentinelOps, Nimbus Flow, Helix Assist, "
            "and Aegis Monitor. Together these offerings support data analysis, cloud management, secure operations, workflow "
            "automation, AI assistance, and continuous monitoring."
        ),
        "business_unit": "Product Management",
        "region": "Global",
        "searchable_text": (
            "core product portfolio products Orion Analytics Atlas Cloud SentinelOps Nimbus Flow Helix Assist Aegis Monitor "
            "data analysis cloud management secure operations workflow automation AI assistance continuous monitoring"
        ),
        "record_metadata": {
            "company": COMPANY_NAME,
            "topic": "products",
            "priority": "foundational",
        },
    },
    {
        "reference_id": "AK-FOUND-004",
        "record_type": "markets",
        "title": "Markets, customers, and delivery focus",
        "content": (
            "The company primarily serves enterprise customers in logistics, healthcare, retail, energy, financial services, "
            "and industrial operations. Its delivery model combines platform subscriptions, managed services, implementation "
            "programs, and long-term customer success support."
        ),
        "business_unit": "Go To Market",
        "region": "Global",
        "searchable_text": (
            "markets customers delivery focus enterprise customers logistics healthcare retail energy financial services "
            "industrial operations platform subscriptions managed services implementation customer success support"
        ),
        "record_metadata": {
            "company": COMPANY_NAME,
            "topic": "markets",
            "priority": "foundational",
        },
    },
]


def _build_record(index: int, rng: random.Random) -> dict:
    unit = BUSINESS_UNITS[index % len(BUSINESS_UNITS)]
    region = REGIONS[(index * 3) % len(REGIONS)]
    product = PRODUCTS[(index * 5) % len(PRODUCTS)]
    customer = CUSTOMERS[(index * 7) % len(CUSTOMERS)]
    project = PROJECTS[(index * 11) % len(PROJECTS)]
    quarter = f"Q{(index % 4) + 1} 2026"
    metric = METRICS[index % len(METRICS)]
    percent = 8 + (index % 19)
    revenue_m = 12 + ((index * 13) % 88)
    employees = 24 + ((index * 17) % 180)
    launch_month = ["September", "October", "November", "December"][index % 4]
    title = f"{unit} operating brief for {quarter}"
    content = (
        f"{COMPANY_NAME} reported that {unit} in {region} accelerated {metric} by {percent} percent. "
        f"{product} remained the lead offer for {customer}, while {project} focused on scaling deployment "
        f"automation for {employees} field specialists. Regional leaders forecast approximately "
        f"${revenue_m}M in influenced annualized revenue if the current adoption pattern holds through {launch_month}."
    )
    return {
        "reference_id": f"AK-{index:06d}",
        "record_type": "business_brief",
        "title": title,
        "content": content,
        "business_unit": unit,
        "region": region,
        "searchable_text": f"{title} {content} {product} {project} {customer} {unit} {region}",
        "record_metadata": {
            "company": COMPANY_NAME,
            "product": product,
            "customer": customer,
            "project": project,
            "quarter": quarter,
            "metric": metric,
            "employees": employees,
        },
        "created_at": datetime.now(UTC) - timedelta(days=rng.randint(1, 360)),
        "updated_at": datetime.now(UTC) - timedelta(days=rng.randint(0, 90)),
    }


def generate_company_knowledge_records(total_records: int, seed: int = 20260819) -> list[dict]:
    rng = random.Random(seed)
    return [_build_record(index, rng) for index in range(1, total_records + 1)]


async def _ensure_foundational_records(db: AsyncSession) -> None:
    existing_ids = set(
        await db.scalars(
            select(CompanyKnowledgeRecord.reference_id).where(
                CompanyKnowledgeRecord.reference_id.in_([record["reference_id"] for record in FOUNDATIONAL_RECORDS])
            )
        )
    )
    missing = [record for record in FOUNDATIONAL_RECORDS if record["reference_id"] not in existing_ids]
    if missing:
        now = datetime.now(UTC)
        db.add_all(
            [
                CompanyKnowledgeRecord(
                    **record,
                    created_at=now,
                    updated_at=now,
                )
                for record in missing
            ]
        )
        await db.commit()


async def seed_company_knowledge(db: AsyncSession, total_records: int = 600) -> None:
    await _ensure_foundational_records(db)
    existing = await db.scalar(select(CompanyKnowledgeRecord.id).limit(1))
    if existing and await db.scalar(select(CompanyKnowledgeRecord.id).offset(len(FOUNDATIONAL_RECORDS)).limit(1)):
        return
    records = generate_company_knowledge_records(total_records)
    db.add_all([CompanyKnowledgeRecord(**record) for record in records])
    await db.commit()
