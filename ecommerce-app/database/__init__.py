"""
Database package for e-commerce application
"""
from .connection import get_db, engine
from .models import Base, Product, Department

__all__ = ["get_db", "engine", "Base", "Product", "Department"]
