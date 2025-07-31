from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from database.connection import get_db
from database.models import Department, Product

router = APIRouter()

# Pydantic models
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: int
    product_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DepartmentListResponse(BaseModel):
    departments: List[DepartmentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class DepartmentWithProducts(DepartmentResponse):
    products: List[dict] = []

@router.get("/", response_model=DepartmentListResponse)
async def get_departments(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in department name"),
    db: Session = Depends(get_db)
):
    """Get all departments with pagination"""
    
    # Build query
    query = db.query(Department)
    
    # Apply search filter
    if search:
        query = query.filter(Department.name.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    departments = query.offset(offset).limit(per_page).all()
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    # Get product counts for each department
    department_responses = []
    for dept in departments:
        product_count = db.query(Product).filter(Product.department_id == dept.id).count()
        dept_dict = {
            "id": dept.id,
            "name": dept.name,
            "description": dept.description,
            "product_count": product_count,
            "created_at": dept.created_at,
            "updated_at": dept.updated_at
        }
        department_responses.append(DepartmentResponse(**dept_dict))
    
    return DepartmentListResponse(
        departments=department_responses,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int = Path(..., description="Department ID"),
    db: Session = Depends(get_db)
):
    """Get a specific department by ID"""
    department = db.query(Department).filter(Department.id == department_id).first()
    
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get product count
    product_count = db.query(Product).filter(Product.department_id == department.id).count()
    
    dept_dict = {
        "id": department.id,
        "name": department.name,
        "description": department.description,
        "product_count": product_count,
        "created_at": department.created_at,
        "updated_at": department.updated_at
    }
    
    return DepartmentResponse(**dept_dict)

@router.get("/{department_id}/products")
async def get_department_products(
    department_id: int = Path(..., description="Department ID"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get all products in a department"""
    
    # Check if department exists
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Get products in this department
    query = db.query(Product).filter(Product.department_id == department_id)
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    # Format products
    product_list = []
    for product in products:
        product_dict = {
            "id": product.id,
            "product_id": product.product_id,
            "product_name": product.product_name,
            "category": product.category,
            "brand": product.brand,
            "sale_price": float(product.sale_price) if product.sale_price else 0,
            "rating": product.rating,
            "discount_percentage": product.discount_percentage
        }
        product_list.append(product_dict)
    
    return {
        "department": {
            "id": department.id,
            "name": department.name,
            "description": department.description
        },
        "products": product_list,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.post("/", response_model=DepartmentResponse, status_code=201)
async def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db)
):
    """Create a new department"""
    
    # Check if department name already exists
    existing_dept = db.query(Department).filter(Department.name == department.name).first()
    if existing_dept:
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    # Create new department
    db_department = Department(**department.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    
    dept_dict = {
        "id": db_department.id,
        "name": db_department.name,
        "description": db_department.description,
        "product_count": 0,
        "created_at": db_department.created_at,
        "updated_at": db_department.updated_at
    }
    
    return DepartmentResponse(**dept_dict)

@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int = Path(..., description="Department ID"),
    department_update: DepartmentUpdate = None,
    db: Session = Depends(get_db)
):
    """Update a department"""
    db_department = db.query(Department).filter(Department.id == department_id).first()
    
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if new name already exists (if name is being updated)
    if department_update.name and department_update.name != db_department.name:
        existing_dept = db.query(Department).filter(Department.name == department_update.name).first()
        if existing_dept:
            raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    # Update department fields
    update_data = department_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_department, field, value)
    
    db.commit()
    db.refresh(db_department)
    
    # Get product count
    product_count = db.query(Product).filter(Product.department_id == db_department.id).count()
    
    dept_dict = {
        "id": db_department.id,
        "name": db_department.name,
        "description": db_department.description,
        "product_count": product_count,
        "created_at": db_department.created_at,
        "updated_at": db_department.updated_at
    }
    
    return DepartmentResponse(**dept_dict)

@router.delete("/{department_id}")
async def delete_department(
    department_id: int = Path(..., description="Department ID"),
    force: bool = Query(False, description="Force delete even if department has products"),
    db: Session = Depends(get_db)
):
    """Delete a department"""
    db_department = db.query(Department).filter(Department.id == department_id).first()
    
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if department has products
    product_count = db.query(Product).filter(Product.department_id == department_id).count()
    
    if product_count > 0 and not force:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete department with {product_count} products. Use force=true to delete anyway."
        )
    
    # If force delete, set department_id to null for all products
    if force and product_count > 0:
        db.query(Product).filter(Product.department_id == department_id).update({"department_id": None})
    
    db.delete(db_department)
    db.commit()
    
    return {"message": "Department deleted successfully"}

@router.get("/stats/summary")
async def get_department_stats(db: Session = Depends(get_db)):
    """Get department statistics"""
    total_departments = db.query(Department).count()
    
    # Departments with product counts
    dept_stats = db.query(
        Department.name,
        func.count(Product.id).label('product_count')
    ).outerjoin(Product).group_by(Department.id, Department.name).all()
    
    # Average products per department
    avg_products = sum(stat[1] for stat in dept_stats) / len(dept_stats) if dept_stats else 0
    
    return {
        "total_departments": total_departments,
        "average_products_per_department": round(avg_products, 2),
        "department_breakdown": [
            {"name": stat[0], "product_count": stat[1]} 
            for stat in sorted(dept_stats, key=lambda x: x[1], reverse=True)
        ]
    }
