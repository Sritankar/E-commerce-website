from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database.connection import get_db
from database.models import Product, Department
from api.utils.helpers import (
    paginate_query, 
    build_product_filters, 
    apply_product_sorting,
    build_product_response,
    calculate_product_stats
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime

class ProductResponse(BaseModel):
    id: int
    product_id: str
    product_name: str
    category: Optional[str] = None
    sub_category: Optional[str] = None
    brand: Optional[str] = None
    sale_price: Optional[float] = None
    market_price: Optional[float] = None
    type: Optional[str] = None
    rating: Optional[float] = None
    description: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    discount_percentage: float = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of products with optional filtering and sorting
    """
    try:
        # Convert empty strings to None to handle frontend parameter issues
        search = search.strip() if search and search.strip() else None
        category = category.strip() if category and category.strip() else None
        brand = brand.strip() if brand and brand.strip() else None
        
        # Validate department_id if provided
        if department_id:
            dept_exists = db.query(Department).filter(Department.id == department_id).first()
            if not dept_exists:
                raise HTTPException(status_code=400, detail=f"Department with ID {department_id} not found")
        
        # Build filters dictionary
        filters = {}
        if search:
            filters['search'] = search
        if category:
            filters['category'] = category
        if brand:
            filters['brand'] = brand
        if department_id:
            filters['department_id'] = department_id
        if min_price is not None:
            filters['min_price'] = min_price
        if max_price is not None:
            filters['max_price'] = max_price
        if min_rating is not None:
            filters['min_rating'] = min_rating
        
        logger.info(f"Products query - Filters: {filters}, Page: {page}, Per page: {per_page}")
        
        # Build query with joins
        query = db.query(Product).outerjoin(Department, Product.department_id == Department.id)
        
        # Apply filters
        query = build_product_filters(query, filters)
        
        # Apply sorting
        query = apply_product_sorting(query, sort_by, sort_order)
        
        # Paginate
        result = paginate_query(query, page, per_page)
        
        # Build response with department names
        products_response = []
        for product in result['items']:
            product_data = build_product_response(product, include_department=True)
            products_response.append(product_data)
        
        response = {
            "products": products_response,
            "total": result['total'],
            "page": result['page'],
            "per_page": result['per_page'],
            "total_pages": result['total_pages']
        }
        
        logger.info(f"Products query successful - Returned {len(products_response)} products")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    try:
        product = db.query(Product).outerjoin(Department).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return build_product_response(product, include_department=True)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get list of all unique categories"""
    try:
        categories = db.query(Product.category)\
                      .filter(Product.category.isnot(None))\
                      .filter(Product.category != '')\
                      .distinct()\
                      .order_by(Product.category)\
                      .all()
        
        return [cat.category for cat in categories if cat.category]
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/brands/list")
async def get_brands(db: Session = Depends(get_db)):
    """Get list of all unique brands"""
    try:
        brands = db.query(Product.brand)\
                  .filter(Product.brand.isnot(None))\
                  .filter(Product.brand != '')\
                  .distinct()\
                  .order_by(Product.brand)\
                  .all()
        
        return [brand.brand for brand in brands if brand.brand]
        
    except Exception as e:
        logger.error(f"Error getting brands: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stats/summary")
async def get_product_stats(db: Session = Depends(get_db)):
    """Get comprehensive product statistics"""
    try:
        stats = calculate_product_stats(db)
        return stats
        
    except Exception as e:
        logger.error(f"Error getting product stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
