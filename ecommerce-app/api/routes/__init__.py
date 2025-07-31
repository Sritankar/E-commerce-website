"""
API routes package
"""

from . import products, departments

# Create a main API router that includes all sub-routers
from fastapi import APIRouter

api_router = APIRouter()

# Include all route modules
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])

__all__ = ["products", "departments", "api_router"]
