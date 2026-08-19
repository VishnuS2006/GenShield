"""chat conversations, roles, and company knowledge

Revision ID: 0002_chat_company_knowledge
Revises: 0001_initial
Create Date: 2026-08-20
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_chat_company_knowledge"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE userrole AS ENUM ('EMPLOYEE', 'SECURITY_ANALYST', 'ADMINISTRATOR');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE messagerole AS ENUM ('USER', 'ASSISTANT');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    user_role = postgresql.ENUM(
        "EMPLOYEE",
        "SECURITY_ANALYST",
        "ADMINISTRATOR",
        name="userrole",
        create_type=False,
    )
    message_role = postgresql.ENUM(
        "USER",
        "ASSISTANT",
        name="messagerole",
        create_type=False,
    )
    decision_role = postgresql.ENUM(
        "ALLOW",
        "WARN",
        "BLOCK",
        name="decision",
        create_type=False,
    )

    op.add_column(
        "users",
        sa.Column(
            "role",
            user_role,
            nullable=False,
            server_default="EMPLOYEE",
        ),
    )

    op.create_table(
        "company_knowledge_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("reference_id", sa.String(length=64), nullable=False),
        sa.Column("record_type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("business_unit", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=100), nullable=True),
        sa.Column("searchable_text", sa.Text(), nullable=False),
        sa.Column("record_metadata", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_company_knowledge_records_reference_id", "company_knowledge_records", ["reference_id"], unique=True)
    op.create_index("ix_company_knowledge_records_record_type", "company_knowledge_records", ["record_type"], unique=False)
    op.create_index("ix_company_knowledge_records_business_unit", "company_knowledge_records", ["business_unit"], unique=False)
    op.create_index("ix_company_knowledge_records_region", "company_knowledge_records", ["region"], unique=False)
    op.execute(
        "CREATE INDEX ix_company_knowledge_records_search ON company_knowledge_records USING gin (to_tsvector('english', searchable_text))"
    )

    op.create_table(
        "chat_conversations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_chat_conversations_user_id", "chat_conversations", ["user_id"], unique=False)

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column(
            "role",
            message_role,
            nullable=False,
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("request_id", sa.String(length=36), nullable=True),
        sa.Column("decision", decision_role, nullable=True),
        sa.Column("risk_score", sa.Integer(), nullable=True),
        sa.Column("similarity_score", sa.Float(), nullable=True),
        sa.Column("matched_source", sa.String(length=255), nullable=True),
        sa.Column("lineage_tag", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_chat_messages_conversation_id", "chat_messages", ["conversation_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_chat_messages_conversation_id", table_name="chat_messages")
    op.drop_table("chat_messages")
    op.drop_index("ix_chat_conversations_user_id", table_name="chat_conversations")
    op.drop_table("chat_conversations")
    op.execute("DROP INDEX IF EXISTS ix_company_knowledge_records_search")
    op.drop_index("ix_company_knowledge_records_region", table_name="company_knowledge_records")
    op.drop_index("ix_company_knowledge_records_business_unit", table_name="company_knowledge_records")
    op.drop_index("ix_company_knowledge_records_record_type", table_name="company_knowledge_records")
    op.drop_index("ix_company_knowledge_records_reference_id", table_name="company_knowledge_records")
    op.drop_table("company_knowledge_records")
    op.drop_column("users", "role")
    postgresql.ENUM(name="messagerole").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="userrole").drop(op.get_bind(), checkfirst=True)
