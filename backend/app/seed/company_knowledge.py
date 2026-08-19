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


async def seed_company_knowledge(db: AsyncSession, total_records: int = 600) -> None:
    existing = await db.scalar(select(CompanyKnowledgeRecord.id).limit(1))
    if existing:
        return
    records = generate_company_knowledge_records(total_records)
    db.add_all([CompanyKnowledgeRecord(**record) for record in records])
    await db.commit()
