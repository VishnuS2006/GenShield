from __future__ import annotations

import argparse
import random
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models.company_knowledge import CompanyKnowledgeRecord
from app.seed.company_knowledge import _build_record


def load_dataset(database_url: str, total_records: int, batch_size: int, clear_existing: bool = True) -> None:
    sync_url = database_url.replace("postgresql+psycopg://", "postgresql+psycopg://")
    engine = create_engine(sync_url)
    rng = random.Random(20260819)
    inserted = 0

    with Session(engine) as session:
        if clear_existing:
            session.query(CompanyKnowledgeRecord).delete()
            session.commit()
            print("Cleared existing company knowledge records.")

        while inserted < total_records:
            current_batch_size = min(batch_size, total_records - inserted)
            batch = [_build_record(inserted + i + 1, rng) for i in range(current_batch_size)]
            session.bulk_insert_mappings(CompanyKnowledgeRecord, batch)
            session.commit()
            inserted += len(batch)
            if inserted % 25000 == 0 or inserted == total_records:
                print(f"Progress: {inserted:,}/{total_records:,} records inserted ({(inserted/total_records)*100:.1f}%)")

    print(f"Successfully generated and committed {total_records:,} company knowledge records in PostgreSQL.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate scalable synthetic company knowledge records for PostgreSQL")
    parser.add_argument("--database-url", default="postgresql+psycopg://genshield:change-me@localhost:5432/genshield", help="PostgreSQL SQLAlchemy URL")
    parser.add_argument("--records", type=int, default=200000, help="Number of records to generate (target: 200,000+)")
    parser.add_argument("--batch-size", type=int, default=10000, help="Bulk insert batch size")
    parser.add_argument("--no-clear", action="store_true", help="Do not delete existing records before seeding")
    args = parser.parse_args()
    load_dataset(args.database_url, args.records, args.batch_size, clear_existing=not args.no_clear)


if __name__ == "__main__":
    main()
