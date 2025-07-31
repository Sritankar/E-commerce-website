from sqlalchemy import Column, Integer, String, Text, DECIMAL, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .connection import Base

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="department")
    
    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(255), unique=True, nullable=False, index=True)
    product_name = Column(String(500), nullable=False, index=True)
    category = Column(String(255), index=True)
    sub_category = Column(String(255), index=True)
    brand = Column(String(255), index=True)
    sale_price = Column(DECIMAL(10, 2), index=True)
    market_price = Column(DECIMAL(10, 2))
    type = Column(String(255))
    rating = Column(Float)
    description = Column(Text)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    department = relationship("Department", back_populates="products")
    
    # Indexes for better performance
    __table_args__ = (
        Index('idx_product_category_brand', 'category', 'brand'),
        Index('idx_product_price_rating', 'sale_price', 'rating'),
        Index('idx_product_search', 'product_name', 'brand', 'category'),
    )
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.product_name}', price={self.sale_price})>"
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.market_price and self.sale_price and self.market_price > 0:
            return round(((self.market_price - self.sale_price) / self.market_price) * 100, 2)
        return 0
