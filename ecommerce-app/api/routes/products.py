from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from decimal import Decimal
from datetime import datetime

from database.connection import get_db
from database.models import Product, Department
from api.config import settings

router = APIRouter()

# Pydantic models for request/response
class ProductBase(BaseModel):
    product_id: str = Field(..., min_length=1, max_length=255)
    product_name: str = Field(..., min_length=1, max_length=500)
    category: Optional[str] = Field(None, max_length=255)
    sub_category: Optional[str] = Field(None, max_length=255)
    brand: Optional[str] = Field(None, max_length=255)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    market_price: Optional[Decimal] = Field(None, ge=0)
    type: Optional[str] = Field(None, max_length=255)
    rating: Optional[float] = Field(None, ge=0, le=5)
    description: Optional[str] = None
    department_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=500)
    category: Optional[str] = Field(None, max_length=255)
    sub_category: Optional[str] = Field(None, max_length=255)
    brand: Optional[str] = Field(None, max_length=255)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    market_price: Optional[Decimal] = Field(None, ge=0)
    type: Optional[str] = Field(None, max_length=255)
    rating: Optional[float] = Field(None, ge=0, le=5)
    description: Optional[str] = None
    department_id: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    discount_percentage: float
    department_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class ProductFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    department_id: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"

@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in product name, brand, category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    department_id: Optional[int] = Query(None, description="Filter by department"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """Get products with filtering, sorting, and pagination"""
    
    # Build query
    query = db.query(Product).options(joinedload(Product.department))
    
    # Apply filters
    if search:
        search_filter = or_(
            Product.product_name.ilike(f"%{search}%"),
            Product.brand.ilike(f"%{search}%"),
            Product.category.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    
    if department_id:
        query = query.filter(Product.department_id == department_id)
    
    if min_price is not None:
        query = query.filter(Product.sale_price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.sale_price <= max_price)
    
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)
    
    # Apply sorting
    if hasattr(Product, sort_by):
        order_column = getattr(Product, sort_by)
        if sort_order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    # Format response
    product_responses = []
    for product in products:
        product_dict = {
            "id": product.id,
            "product_id": product.product_id,
            "product_name": product.product_name,
            "category": product.category,
            "sub_category": product.sub_category,
            "brand": product.brand,
            "sale_price": product.sale_price,
            "market_price": product.market_price,
            "type": product.type,
            "rating": product.rating,
            "description": product.description,
            "department_id": product.department_id,
            "discount_percentage": product.discount_percentage,
            "department_name": product.department.name if product.department else None,
            "created_at": product.created_at,
            "updated_at": product.updated_at
        }
        product_responses.append(ProductResponse(**product_dict))
    
    return ProductListResponse(
        products=product_responses,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int = Path(..., description="Product ID"),
    db: Session = Depends(get_db)
):
    """Get a specific product by ID"""
    product = db.query(Product).options(joinedload(Product.department)).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = {
        "id": product.id,
        "product_id": product.product_id,
        "product_name": product.product_name,
        "category": product.category,
        "sub_category": product.sub_category,
        "brand": product.brand,
        "sale_price": product.sale_price,
        "market_price": product.market_price,
        "type": product.type,
        "rating": product.rating,
        "description": product.description,
        "department_id": product.department_id,
        "discount_percentage": product.discount_percentage,
        "department_name": product.department.name if product.department else None,
        "created_at": product.created_at,
        "updated_at": product.updated_at
    }
    
    return ProductResponse(**product_dict)

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product"""
    
    # Check if product_id already exists
    existing_product = db.query(Product).filter(Product.product_id == product.product_id).first()
    if existing_product:
        raise HTTPException(status_code=400, detail="Product with this ID already exists")
    
    # Validate department_id if provided
    if product.department_id:
        department = db.query(Department).filter(Department.id == product.department_id).first()
        if not department:
            raise HTTPException(status_code=400, detail="Department not found")
    
    # Create new product
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Load department for response
    db.refresh(db_product)
    product_with_dept = db.query(Product).options(joinedload(Product.department)).filter(Product.id == db_product.id).first()
    
    product_dict = {
        "id": product_with_dept.id,
        "product_id": product_with_dept.product_id,
        "product_name": product_with_dept.product_name,
        "category": product_with_dept.category,
        "sub_category": product_with_dept.sub_category,
        "brand": product_with_dept.brand,
        "sale_price": product_with_dept.sale_price,
        "market_price": product_with_dept.market_price,
        "type": product_with_dept.type,
        "rating": product_with_dept.rating,
        "description": product_with_dept.description,
        "department_id": product_with_dept.department_id,
        "discount_percentage": product_with_dept.discount_percentage,
        "department_name": product_with_dept.department.name if product_with_dept.department else None,
        "created_at": product_with_dept.created_at,
        "updated_at": product_with_dept.updated_at
    }
    
    return ProductResponse(**product_dict)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int = Path(..., description="Product ID"),
    product_update: ProductUpdate = None,
    db: Session = Depends(get_db)
):
    """Update a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate department_id if provided
    if product_update.department_id:
        department = db.query(Department).filter(Department.id == product_update.department_id).first()
        if not department:
            raise HTTPException(status_code=400, detail="Department not found")
    
    # Update product fields
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    
    # Load department for response
    product_with_dept = db.query(Product).options(joinedload(Product.department)).filter(Product.id == product_id).first()
    
    product_dict = {
        "id": product_with_dept.id,
        "product_id": product_with_dept.product_id,
        "product_name": product_with_dept.product_name,
        "category": product_with_dept.category,
        "sub_category": product_with_dept.sub_category,
        "brand": product_with_dept.brand,
        "sale_price": product_with_dept.sale_price,
        "market_price": product_with_dept.market_price,
        "type": product_with_dept.type,
        "rating": product_with_dept.rating,
        "description": product_with_dept.description,
        "department_id": product_with_dept.department_id,
        "discount_percentage": product_with_dept.discount_percentage,
        "department_name": product_with_dept.department.name if product_with_dept.department else None,
        "created_at": product_with_dept.created_at,
        "updated_at": product_with_dept.updated_at
    }
    
    return ProductResponse(**product_dict)

@router.delete("/{product_id}")
async def delete_product(
    product_id: int = Path(..., description="Product ID"),
    db: Session = Depends(get_db)
):
    """Delete a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    
    return {"message": "Product deleted successfully"}

@router.get("/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get all unique categories"""
    categories = db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/brands/list")
async def get_brands(db: Session = Depends(get_db)):
    """Get all unique brands"""
    brands = db.query(Product.brand).distinct().filter(Product.brand.isnot(None)).all()
    return [brand[0] for brand in brands if brand[0]]

@router.get("/stats/summary")
async def get_product_stats(db: Session = Depends(get_db)):
    """Get product statistics"""
    total_products = db.query(Product).count()
    avg_price = db.query(func.avg(Product.sale_price)).scalar() or 0
    min_price = db.query(func.min(Product.sale_price)).scalar() or 0
    max_price = db.query(func.max(Product.sale_price)).scalar() or 0
    avg_rating = db.query(func.avg(Product.rating)).scalar() or 0
    
    # Top categories
    top_categories = db.query(
        Product.category,
        func.count(Product.id).label('count')
    ).group_by(Product.category).order_by(func.count(Product.id).desc()).limit(10).all()
    
    # Top brands
    top_brands = db.query(
        Product.brand,
        func.count(Product.id).label('count')
    ).group_by(Product.brand).order_by(func.count(Product.id).desc()).limit(10).all()
    
    return {
        "total_products": total_products,
        "average_price": float(avg_price),
        "price_range": {
            "min": float(min_price),
            "max": float(max_price)
        },
        "average_rating": float(avg_rating),
        "top_categories": [{"name": cat[0], "count": cat[1]} for cat in top_categories],
        "top_brands": [{"name": brand[0], "count": brand[1]} for brand in top_brands]
    }
