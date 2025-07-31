"""Create departments table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Create departments table
    op.create_table('departments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Add department_id to products table
    op.add_column('products', sa.Column('department_id', sa.Integer(), nullable=True))
    op.create_index('idx_products_department', 'products', ['department_id'])
    op.create_foreign_key('fk_products_department', 'products', 'departments', ['department_id'], ['id'])

def downgrade():
    op.drop_constraint('fk_products_department', 'products', type_='foreignkey')
    op.drop_index('idx_products_department', 'products')
    op.drop_column('products', 'department_id')
    op.drop_table('departments')
