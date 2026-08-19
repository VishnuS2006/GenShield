"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-19
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "protected_documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("department", sa.String(length=100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sensitivity", sa.Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="sensitivitylevel"), nullable=False),
        sa.Column("lineage_tag", sa.String(length=100), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "protected_facts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("protected_documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("fact_type", sa.String(length=100), nullable=False),
        sa.Column("fact_value", sa.Text(), nullable=False),
        sa.Column("importance", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "detection_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.String(length=36), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=False),
        sa.Column("factual_overlap_score", sa.Float(), nullable=False),
        sa.Column("facts_matched", sa.Integer(), nullable=False),
        sa.Column("facts_total", sa.Integer(), nullable=False),
        sa.Column("sensitivity_score", sa.Integer(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("decision", sa.Enum("ALLOW", "WARN", "BLOCK", name="decision"), nullable=False),
        sa.Column("matched_document_id", sa.Integer(), sa.ForeignKey("protected_documents.id"), nullable=True),
        sa.Column("matched_facts", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_detection_results_request_id", "detection_results", ["request_id"], unique=True)
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("generated_response", sa.Text(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("decision", sa.Enum("ALLOW", "WARN", "BLOCK", name="decision"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "data_lineage",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("request_id", sa.String(length=36), nullable=False),
        sa.Column("detection_result_id", sa.Integer(), sa.ForeignKey("detection_results.id", ondelete="CASCADE"), nullable=False),
        sa.Column("protected_document_id", sa.Integer(), sa.ForeignKey("protected_documents.id"), nullable=False),
        sa.Column("lineage_tag", sa.String(length=100), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("data_lineage")
    op.drop_table("audit_logs")
    op.drop_index("ix_detection_results_request_id", table_name="detection_results")
    op.drop_table("detection_results")
    op.drop_table("protected_facts")
    op.drop_table("protected_documents")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
