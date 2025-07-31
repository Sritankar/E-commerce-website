"""Create products table

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create products table
    op.create_table('products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.String(length=255), nullable=False),
        sa.Column('product_name', sa.String(length=500), nullable=False),
        sa.Column('category', sa.String(length=255), nullable=True),
        sa.Column('sub_category', sa.String(length=255), nullable=True),
        sa.Column('brand', sa.String(length=255), nullable=True),
        sa.Column('sale_price', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('market_price', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('type', sa.String(length=255), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id')
    )
    
    # Create indexes
    op.create_index('idx_products_category', 'products', ['category'])
    op.create_index('idx_products_brand', 'products', ['brand'])
    op.create_index('idx_products_price', 'products', ['sale_price'])
    op.create_index('idx_products_name', 'products', ['product_name'])

def downgrade():
    op.drop_table('products')
