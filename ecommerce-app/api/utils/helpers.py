from typing import Dict, Any, Optional, List, Union
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from database.models import Product, Department
import logging
from decimal import Decimal
import re
from datetime import datetime

logger = logging.getLogger(__name__)

def paginate_query(query, page: int = 1, per_page: int = 20, max_per_page: int = 100):
    """
    Paginate a SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-based)
        per_page: Items per page
        max_per_page: Maximum items per page
    
    Returns:
        dict: Pagination information and items
    """
    # Validate and limit per_page
    per_page = min(per_page, max_per_page)
    per_page = max(per_page, 1)
    
    # Validate page
    page = max(page, 1)
    
    # Get total count
    total = query.count()
    
    # Calculate pagination info
    total_pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page
    
    # Get items for current page
    items = query.offset(offset).limit(per_page).all()
    
    return {
        'items': items,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
        'has_prev': page > 1,
        'has_next': page < total_pages,
        'prev_page': page - 1 if page > 1 else None,
        'next_page': page + 1 if page < total_pages else None
    }

def build_product_filters(query, filters: Dict[str, Any]):
    """
    Build product filters for SQLAlchemy query
    
    Args:
        query: SQLAlchemy query object
        filters: Dictionary of filter parameters
    
    Returns:
        SQLAlchemy query with applied filters
    """
    # Search filter - searches across multiple fields
    if filters.get('search'):
        search_term = f"%{filters['search']}%"
        search_conditions = [
            Product.product_name.ilike(search_term),
            Product.brand.ilike(search_term),
            Product.category.ilike(search_term),
            Product.sub_category.ilike(search_term),
            Product.description.ilike(search_term)
        ]
        query = query.filter(or_(*search_conditions))
    
    # Category filter
    if filters.get('category'):
        query = query.filter(Product.category.ilike(f"%{filters['category']}%"))
    
    # Sub-category filter
    if filters.get('sub_category'):
        query = query.filter(Product.sub_category.ilike(f"%{filters['sub_category']}%"))
    
    # Brand filter
    if filters.get('brand'):
        query = query.filter(Product.brand.ilike(f"%{filters['brand']}%"))
    
    # Type filter
    if filters.get('type'):
        query = query.filter(Product.type.ilike(f"%{filters['type']}%"))
    
    # Department filter
    if filters.get('department_id'):
        try:
            dept_id = int(filters['department_id'])
            query = query.filter(Product.department_id == dept_id)
        except (ValueError, TypeError):
            logger.warning(f"Invalid department_id: {filters['department_id']}")
    
    # Price range filters
    if filters.get('min_price'):
        try:
            min_price = float(filters['min_price'])
            query = query.filter(Product.sale_price >= min_price)
        except (ValueError, TypeError):
            logger.warning(f"Invalid min_price: {filters['min_price']}")
    
    if filters.get('max_price'):
        try:
            max_price = float(filters['max_price'])
            query = query.filter(Product.sale_price <= max_price)
        except (ValueError, TypeError):
            logger.warning(f"Invalid max_price: {filters['max_price']}")
    
    # Rating filter
    if filters.get('min_rating'):
        try:
            min_rating = float(filters['min_rating'])
            query = query.filter(Product.rating >= min_rating)
        except (ValueError, TypeError):
            logger.warning(f"Invalid min_rating: {filters['min_rating']}")
    
    # In stock filter (sale_price > 0)
    if filters.get('in_stock'):
        if str(filters['in_stock']).lower() in ['true', '1', 'yes']:
            query = query.filter(Product.sale_price > 0)
    
    # On sale filter (has market_price > sale_price)
    if filters.get('on_sale'):
        if str(filters['on_sale']).lower() in ['true', '1', 'yes']:
            query = query.filter(
                and_(
                    Product.market_price.isnot(None),
                    Product.sale_price.isnot(None),
                    Product.market_price > Product.sale_price
                )
            )
    
    return query

def apply_product_sorting(query, sort_by: str = 'created_at', sort_order: str = 'desc'):
    """
    Apply sorting to product query
    
    Args:
        query: SQLAlchemy query object
        sort_by: Field to sort by
        sort_order: Sort order ('asc' or 'desc')
    
    Returns:
        SQLAlchemy query with applied sorting
    """
    # Validate sort_order
    if sort_order.lower() not in ['asc', 'desc']:
        sort_order = 'desc'
    
    # Get the column to sort by
    sort_column = None
    
    # Map sort fields to actual columns
    sort_mapping = {
        'name': Product.product_name,
        'product_name': Product.product_name,
        'price': Product.sale_price,
        'sale_price': Product.sale_price,
        'market_price': Product.market_price,
        'rating': Product.rating,
        'category': Product.category,
        'brand': Product.brand,
        'created_at': Product.created_at,
        'updated_at': Product.updated_at,
        'id': Product.id
    }
    
    sort_column = sort_mapping.get(sort_by.lower())
    
    if sort_column is None:
        # Default to created_at if invalid sort field
        sort_column = Product.created_at
        logger.warning(f"Invalid sort field '{sort_by}', using 'created_at'")
    
    # Apply sorting
    if sort_order.lower() == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    return query

def calculate_product_stats(db: Session) -> Dict[str, Any]:
    """
    Calculate various product statistics
    
    Args:
        db: Database session
    
    Returns:
        dict: Product statistics
    """
    try:
        # Basic counts
        total_products = db.query(Product).count()
        total_departments = db.query(Department).count()
        
        # Products with complete information
        products_with_prices = db.query(Product).filter(Product.sale_price.isnot(None)).count()
        products_with_ratings = db.query(Product).filter(Product.rating.isnot(None)).count()
        products_with_departments = db.query(Product).filter(Product.department_id.isnot(None)).count()
        
        # Price statistics
        price_stats = db.query(
            func.avg(Product.sale_price).label('avg_price'),
            func.min(Product.sale_price).label('min_price'),
            func.max(Product.sale_price).label('max_price'),
            func.count(Product.sale_price).label('price_count')
        ).filter(Product.sale_price.isnot(None)).first()
        
        # Rating statistics
        rating_stats = db.query(
            func.avg(Product.rating).label('avg_rating'),
            func.min(Product.rating).label('min_rating'),
            func.max(Product.rating).label('max_rating'),
            func.count(Product.rating).label('rated_products')
        ).filter(Product.rating.isnot(None)).first()
        
        # Top categories
        top_categories = db.query(
            Product.category,
            func.count(Product.id).label('count')
        ).filter(Product.category.isnot(None))\
         .group_by(Product.category)\
         .order_by(func.count(Product.id).desc())\
         .limit(10).all()
        
        # Top brands
        top_brands = db.query(
            Product.brand,
            func.count(Product.id).label('count')
        ).filter(Product.brand.isnot(None))\
         .group_by(Product.brand)\
         .order_by(func.count(Product.id).desc())\
         .limit(10).all()
        
        # Products on sale (market_price > sale_price)
        on_sale_count = db.query(Product).filter(
            and_(
                Product.market_price.isnot(None),
                Product.sale_price.isnot(None),
                Product.market_price > Product.sale_price
            )
        ).count()
        
        # Price ranges
        price_ranges = db.query(
            func.count(Product.id).label('count'),
            func.case(
                (Product.sale_price < 25, 'Under $25'),
                (Product.sale_price < 50, '$25-$50'),
                (Product.sale_price < 100, '$50-$100'),
                (Product.sale_price < 250, '$100-$250'),
                (Product.sale_price < 500, '$250-$500'),
                else_='$500+'
            ).label('range')
        ).filter(Product.sale_price.isnot(None))\
         .group_by('range')\
         .all()
        
        return {
            'total_products': total_products,
            'total_departments': total_departments,
            'products_with_prices': products_with_prices,
            'products_with_ratings': products_with_ratings,
            'products_with_departments': products_with_departments,
            'products_on_sale': on_sale_count,
            'average_price': float(price_stats.avg_price or 0),
            'price_range': {
                'min': float(price_stats.min_price or 0),
                'max': float(price_stats.max_price or 0)
            },
            'average_rating': float(rating_stats.avg_rating or 0),
            'rating_range': {
                'min': float(rating_stats.min_rating or 0),
                'max': float(rating_stats.max_rating or 0)
            },
            'rated_products': rating_stats.rated_products or 0,
            'top_categories': [
                {'name': cat.category, 'count': cat.count}
                for cat in top_categories
            ],
            'top_brands': [
                {'name': brand.brand, 'count': brand.count}
                for brand in top_brands
            ],
            'price_distribution': [
                {'range': pr.range, 'count': pr.count}
                for pr in price_ranges
            ]
        }
    
    except Exception as e:
        logger.error(f"Error calculating product stats: {e}")
        return {
            'total_products': 0,
            'total_departments': 0,
            'products_with_prices': 0,
            'products_with_ratings': 0,
            'products_with_departments': 0,
            'products_on_sale': 0,
            'average_price': 0,
            'price_range': {'min': 0, 'max': 0},
            'average_rating': 0,
            'rating_range': {'min': 0, 'max': 0},
            'rated_products': 0,
            'top_categories': [],
            'top_brands': [],
            'price_distribution': []
        }

def calculate_department_stats(db: Session) -> Dict[str, Any]:
    """
    Calculate department statistics
    
    Args:
        db: Database session
    
    Returns:
        dict: Department statistics
    """
    try:
        # Total departments
        total_departments = db.query(Department).count()
        
        # Department breakdown with product counts
        dept_breakdown = db.query(
            Department.id,
            Department.name,
            Department.description,
            func.count(Product.id).label('product_count'),
            func.avg(Product.sale_price).label('avg_price'),
            func.avg(Product.rating).label('avg_rating')
        ).outerjoin(Product)\
         .group_by(Department.id, Department.name, Department.description)\
         .order_by(func.count(Product.id).desc()).all()
        
        # Calculate statistics
        total_products = sum(dept.product_count for dept in dept_breakdown)
        avg_products = total_products / total_departments if total_departments > 0 else 0
        
        # Departments with/without products
        departments_with_products = sum(1 for dept in dept_breakdown if dept.product_count > 0)
        departments_without_products = total_departments - departments_with_products
        
        return {
            'total_departments': total_departments,
            'departments_with_products': departments_with_products,
            'departments_without_products': departments_without_products,
            'total_products_across_departments': total_products,
            'average_products_per_department': round(avg_products, 2),
            'department_breakdown': [
                {
                    'id': dept.id,
                    'name': dept.name,
                    'description': dept.description,
                    'product_count': dept.product_count,
                    'average_price': float(dept.avg_price or 0),
                    'average_rating': float(dept.avg_rating or 0)
                }
                for dept in dept_breakdown
            ]
        }
    
    except Exception as e:
        logger.error(f"Error calculating department stats: {e}")
        return {
            'total_departments': 0,
            'departments_with_products': 0,
            'departments_without_products': 0,
            'total_products_across_departments': 0,
            'average_products_per_department': 0,
            'department_breakdown': []
        }

def validate_pagination_params(page: Optional[int], per_page: Optional[int]) -> tuple:
    """
    Validate and normalize pagination parameters
    
    Args:
        page: Page number
        per_page: Items per page
    
    Returns:
        tuple: (validated_page, validated_per_page)
    """
    # Validate page
    if page is None or page < 1:
        page = 1
    
    # Validate per_page
    if per_page is None or per_page < 1:
        per_page = 20
    elif per_page > 100:
        per_page = 100
    
    return page, per_page

def format_api_response(data: Any, message: str = "Success", status_code: int = 200) -> Dict[str, Any]:
    """
    Format API response consistently
    
    Args:
        data: Response data
        message: Response message
        status_code: HTTP status code
    
    Returns:
        dict: Formatted response
    """
    return {
        'status_code': status_code,
        'message': message,
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }

def format_error_response(message: str, status_code: int = 400, details: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Format error response consistently
    
    Args:
        message: Error message
        status_code: HTTP status code
        details: Additional error details
    
    Returns:
        dict: Formatted error response
    """
    response = {
        'status_code': status_code,
        'error': message,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if details:
        response['details'] = details
    
    return response

def safe_int_conversion(value: Any, default: int = 0) -> int:
    """
    Safely convert value to integer
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
    
    Returns:
        int: Converted integer or default
    """
    try:
        if value is None or value == '':
            return default
        return int(value)
    except (ValueError, TypeError):
        return default

def safe_float_conversion(value: Any, default: float = 0.0) -> float:
    """
    Safely convert value to float
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
    
    Returns:
        float: Converted float or default
    """
    try:
        if value is None or value == '':
            return default
        return float(value)
    except (ValueError, TypeError):
        return default

def clean_search_term(search_term: str) -> str:
    """
    Clean and sanitize search term
    
    Args:
        search_term: Raw search term
    
    Returns:
        str: Cleaned search term
    """
    if not search_term:
        return ""
    
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', search_term.strip())
    
    # Remove potentially harmful characters for SQL
    cleaned = re.sub(r'[%_\\]', '', cleaned)
    
    # Limit length
    cleaned = cleaned[:100]
    
    return cleaned

def build_search_suggestions(db: Session, search_term: str, limit: int = 5) -> List[str]:
    """
    Build search suggestions based on search term
    
    Args:
        db: Database session
        search_term: Search term
        limit: Maximum number of suggestions
    
    Returns:
        list: Search suggestions
    """
    try:
        if not search_term or len(search_term) < 2:
            return []
        
        suggestions = []
        
        # Get category suggestions
        categories = db.query(Product.category)\
            .filter(Product.category.ilike(f"%{search_term}%"))\
            .distinct()\
            .limit(limit)\
            .all()
        
        suggestions.extend([cat.category for cat in categories if cat.category])
        
        # Get brand suggestions if we have space
        if len(suggestions) < limit:
            brands = db.query(Product.brand)\
                .filter(Product.brand.ilike(f"%{search_term}%"))\
                .distinct()\
                .limit(limit - len(suggestions))\
                .all()
            
            suggestions.extend([brand.brand for brand in brands if brand.brand])
        
        return suggestions[:limit]
    
    except Exception as e:
        logger.error(f"Error building search suggestions: {e}")
        return []

def calculate_discount_percentage(market_price: Optional[float], sale_price: Optional[float]) -> float:
    """
    Calculate discount percentage
    
    Args:
        market_price: Original market price
        sale_price: Current sale price
    
    Returns:
        float: Discount percentage
    """
    if not market_price or not sale_price or market_price <= sale_price:
        return 0.0
    
    return round(((market_price - sale_price) / market_price) * 100, 2)

def validate_price_range(min_price: Optional[float], max_price: Optional[float]) -> tuple:
    """
    Validate price range parameters
    
    Args:
        min_price: Minimum price
        max_price: Maximum price
    
    Returns:
        tuple: (validated_min_price, validated_max_price)
    """
    # Ensure prices are non-negative
    if min_price is not None and min_price < 0:
        min_price = 0
    
    if max_price is not None and max_price < 0:
        max_price = None
    
    # Ensure min_price <= max_price
    if min_price is not None and max_price is not None and min_price > max_price:
        min_price, max_price = max_price, min_price
    
    return min_price, max_price

def build_product_response(product: Product, include_department: bool = True) -> Dict[str, Any]:
    """
    Build standardized product response
    
    Args:
        product: Product model instance
        include_department: Whether to include department information
    
    Returns:
        dict: Formatted product response
    """
    response = {
        'id': product.id,
        'product_id': product.product_id,
        'product_name': product.product_name,
        'category': product.category,
        'sub_category': product.sub_category,
        'brand': product.brand,
        'sale_price': float(product.sale_price) if product.sale_price else None,
        'market_price': float(product.market_price) if product.market_price else None,
        'type': product.type,
        'rating': product.rating,
        'description': product.description,
        'department_id': product.department_id,
        'discount_percentage': product.discount_percentage,
        'created_at': product.created_at.isoformat() if product.created_at else None,
        'updated_at': product.updated_at.isoformat() if product.updated_at else None
    }
    
    if include_department and product.department:
        response['department_name'] = product.department.name
    else:
        response['department_name'] = None
    
    return response

def get_unique_values(db: Session, model_class, field_name: str, limit: int = 100) -> List[str]:
    """
    Get unique values for a specific field
    
    Args:
        db: Database session
        model_class: SQLAlchemy model class
        field_name: Field name to get unique values for
        limit: Maximum number of values to return
    
    Returns:
        list: Unique values
    """
    try:
        field = getattr(model_class, field_name)
        values = db.query(field)\
            .filter(field.isnot(None))\
            .filter(field != '')\
            .distinct()\
            .order_by(field)\
            .limit(limit)\
            .all()
        
        return [value[0] for value in values if value[0]]
    
    except Exception as e:
        logger.error(f"Error getting unique values for {field_name}: {e}")
        return []

def log_api_request(endpoint: str, method: str, params: Dict, user_id: Optional[str] = None):
    """
    Log API request for monitoring and analytics
    
    Args:
        endpoint: API endpoint
        method: HTTP method
        params: Request parameters
        user_id: User ID if available
    """
    try:
        logger.info(f"API Request - {method} {endpoint}", extra={
            'endpoint': endpoint,
            'method': method,
            'params': params,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error logging API request: {e}")
