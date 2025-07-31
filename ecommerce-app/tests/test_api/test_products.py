import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from decimal import Decimal

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent.parent))

from api.app import app
from database.connection import SessionLocal, create_tables, drop_tables
from database.models import Product, Department

# Create test client
client = TestClient(app)

@pytest.fixture(scope="module")
def setup_test_db():
    """Setup test database"""
    create_tables()
    yield
    drop_tables()

@pytest.fixture
def db_session():
    """Create database session for tests"""
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture
def sample_department(db_session):
    """Create sample department"""
    department = Department(
        name="Test Electronics",
        description="Test electronics department"
    )
    db_session.add(department)
    db_session.commit()
    db_session.refresh(department)
    return department

@pytest.fixture
def sample_products(db_session, sample_department):
    """Create sample products"""
    products = [
        Product(
            product_id="TEST001",
            product_name="Test Laptop",
            category="Computers",
            brand="TestBrand",
            sale_price=Decimal("999.99"),
            market_price=Decimal("1299.99"),
            rating=4.5,
            description="Test laptop description",
            department_id=sample_department.id
        ),
        Product(
            product_id="TEST002",
            product_name="Test Phone",
            category="Electronics",
            brand="PhoneBrand",
            sale_price=Decimal("699.99"),
            rating=4.2,
            description="Test phone description",
            department_id=sample_department.id
        ),
        Product(
            product_id="TEST003",
            product_name="Test Tablet",
            category="Electronics",
            brand="TabletBrand",
            sale_price=Decimal("399.99"),
            rating=3.8,
            description="Test tablet description"
        )
    ]
    
    db_session.add_all(products)
    db_session.commit()
    
    for product in products:
        db_session.refresh(product)
    
    return products

class TestProductsAPI:
    """Test Products API endpoints"""
    
    def test_get_products_empty(self, setup_test_db):
        """Test getting products when database is empty"""
        response = client.get("/api/v1/products/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 0
        assert data["products"] == []
        assert data["page"] == 1
        assert data["per_page"] == 20
    
    def test_get_products_with_data(self, setup_test_db, sample_products):
        """Test getting products with data"""
        response = client.get("/api/v1/products/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 3
        assert len(data["products"]) == 3
        assert data["page"] == 1
        assert data["per_page"] == 20
        
        # Check first product
        product = data["products"][0]
        assert "id" in product
        assert "product_name" in product
        assert "sale_price" in product
        assert "discount_percentage" in product
    
    def test_get_products_pagination(self, setup_test_db, sample_products):
        """Test products pagination"""
        # Get first page with 2 items per page
        response = client.get("/api/v1/products/?page=1&per_page=2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 3
        assert len(data["products"]) == 2
        assert data["page"] == 1
        assert data["per_page"] == 2
        assert data["total_pages"] == 2
        
        # Get second page
        response = client.get("/api/v1/products/?page=2&per_page=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["products"]) == 1
        assert data["page"] == 2
    
    def test_get_products_search(self, setup_test_db, sample_products):
        """Test product search"""
        response = client.get("/api/v1/products/?search=laptop")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 1
        assert len(data["products"]) == 1
        assert "laptop" in data["products"][0]["product_name"].lower()
    
    def test_get_products_filter_by_category(self, setup_test_db, sample_products):
        """Test filtering products by category"""
        response = client.get("/api/v1/products/?category=Electronics")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 2  # Phone and Tablet
        assert all("Electronics" in p["category"] for p in data["products"])
    
    def test_get_products_filter_by_brand(self, setup_test_db, sample_products):
        """Test filtering products by brand"""
        response = client.get("/api/v1/products/?brand=TestBrand")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 1
        assert data["products"][0]["brand"] == "TestBrand"
    
    def test_get_products_filter_by_price_range(self, setup_test_db, sample_products):
        """Test filtering products by price range"""
        response = client.get("/api/v1/products/?min_price=400&max_price=800")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 1  # Only phone should match
        product = data["products"][0]
        assert 400 <= float(product["sale_price"]) <= 800
    
    def test_get_products_filter_by_rating(self, setup_test_db, sample_products):
        """Test filtering products by minimum rating"""
        response = client.get("/api/v1/products/?min_rating=4.0")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 2  # Laptop and phone
        assert all(p["rating"] >= 4.0 for p in data["products"] if p["rating"])
    
    def test_get_products_sorting(self, setup_test_db, sample_products):
        """Test product sorting"""
        # Sort by price ascending
        response = client.get("/api/v1/products/?sort_by=sale_price&sort_order=asc")
        assert response.status_code == 200
        
        data = response.json()
        prices = [float(p["sale_price"]) for p in data["products"]]
        assert prices == sorted(prices)
        
        # Sort by price descending
        response = client.get("/api/v1/products/?sort_by=sale_price&sort_order=desc")
        assert response.status_code == 200
        
        data = response.json()
        prices = [float(p["sale_price"]) for p in data["products"]]
        assert prices == sorted(prices, reverse=True)
    
    def test_get_product_by_id(self, setup_test_db, sample_products):
        """Test getting a specific product by ID"""
        product_id = sample_products[0].id
        response = client.get(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == product_id
        assert data["product_name"] == "Test Laptop"
        assert "discount_percentage" in data
        assert "department_name" in data
    
    def test_get_product_not_found(self, setup_test_db):
        """Test getting non-existent product"""
        response = client.get("/api/v1/products/99999")
        assert response.status_code == 404
        
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    def test_create_product(self, setup_test_db, sample_department):
        """Test creating a new product"""
        product_data = {
            "product_id": "NEW001",
            "product_name": "New Test Product",
            "category": "New Category",
            "brand": "NewBrand",
            "sale_price": 299.99,
            "market_price": 399.99,
            "rating": 4.0,
            "description": "New product description",
            "department_id": sample_department.id
        }
        
        response = client.post("/api/v1/products/", json=product_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["product_id"] == "NEW001"
        assert data["product_name"] == "New Test Product"
        assert data["department_name"] == sample_department.name
    
    def test_create_product_duplicate_id(self, setup_test_db, sample_products):
        """Test creating product with duplicate product_id"""
        product_data = {
            "product_id": "TEST001",  # Same as existing product
            "product_name": "Duplicate Product",
            "sale_price": 100.00
        }
        
        response = client.post("/api/v1/products/", json=product_data)
        assert response.status_code == 400
        
        data = response.json()
        assert "already exists" in data["detail"].lower()
    
    def test_create_product_invalid_department(self, setup_test_db):
        """Test creating product with invalid department"""
        product_data = {
            "product_id": "INVALID001",
            "product_name": "Invalid Department Product",
            "sale_price": 100.00,
            "department_id": 99999  # Non-existent department
        }
        
        response = client.post("/api/v1/products/", json=product_data)
        assert response.status_code == 400
        
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    def test_update_product(self, setup_test_db, sample_products):
        """Test updating a product"""
        product_id = sample_products[0].id
        update_data = {
            "product_name": "Updated Laptop",
            "sale_price": 1099.99
        }
        
        response = client.put(f"/api/v1/products/{product_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["product_name"] == "Updated Laptop"
        assert float(data["sale_price"]) == 1099.99
    
    def test_update_product_not_found(self, setup_test_db):
        """Test updating non-existent product"""
        update_data = {
            "product_name": "Non-existent Product"
        }
        
        response = client.put("/api/v1/products/99999", json=update_data)
        assert response.status_code == 404
    
    def test_delete_product(self, setup_test_db, sample_products):
        """Test deleting a product"""
        product_id = sample_products[0].id
        
        response = client.delete(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "deleted" in data["message"].lower()
        
        # Verify product is deleted
        response = client.get(f"/api/v1/products/{product_id}")
        assert response.status_code == 404
    
    def test_delete_product_not_found(self, setup_test_db):
        """Test deleting non-existent product"""
        response = client.delete("/api/v1/products/99999")
        assert response.status_code == 404

class TestProductsUtilityEndpoints:
    """Test utility endpoints for products"""
    
    def test_get_categories(self, setup_test_db, sample_products):
        """Test getting list of categories"""
        response = client.get("/api/v1/products/categories/list")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert "Computers" in data
        assert "Electronics" in data
    
    def test_get_brands(self, setup_test_db, sample_products):
        """Test getting list of brands"""
        response = client.get("/api/v1/products/brands/list")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert "TestBrand" in data
        assert "PhoneBrand" in data
    
    def test_get_product_stats(self, setup_test_db, sample_products):
        """Test getting product statistics"""
        response = client.get("/api/v1/products/stats/summary")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_products"] == 3
        assert "average_price" in data
        assert "price_range" in data
        assert "average_rating" in data
        assert "top_categories" in data
        assert "top_brands" in data
        
        # Check price range
        assert data["price_range"]["min"] > 0
        assert data["price_range"]["max"] > data["price_range"]["min"]
