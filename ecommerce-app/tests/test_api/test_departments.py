import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent.parent))

from api.app import app
from database.connection import SessionLocal, create_tables, drop_tables
from database.models import Product, Department
from decimal import Decimal

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
def sample_departments(db_session):
    """Create sample departments"""
    departments = [
        Department(
            name="Electronics",
            description="Electronic devices and accessories"
        ),
        Department(
            name="Books",
            description="Books and literature"
        ),
        Department(
            name="Clothing",
            description="Apparel and fashion"
        )
    ]
    
    db_session.add_all(departments)
    db_session.commit()
    
    for dept in departments:
        db_session.refresh(dept)
    
    return departments

@pytest.fixture
def departments_with_products(db_session, sample_departments):
    """Create departments with products"""
    # Add products to electronics department
    products = [
        Product(
            product_id="ELEC001",
            product_name="Smartphone",
            sale_price=Decimal("699.99"),
            department_id=sample_departments[0].id  # Electronics
        ),
        Product(
            product_id="ELEC002",
            product_name="Laptop",
            sale_price=Decimal("999.99"),
            department_id=sample_departments[0].id  # Electronics
        ),
        Product(
            product_id="BOOK001",
            product_name="Python Guide",
            sale_price=Decimal("29.99"),
            department_id=sample_departments[1].id  # Books
        )
    ]
    
    db_session.add_all(products)
    db_session.commit()
    
    return sample_departments

class TestDepartmentsAPI:
    """Test Departments API endpoints"""
    
    def test_get_departments_empty(self, setup_test_db):
        """Test getting departments when database is empty"""
        response = client.get("/api/v1/departments/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 0
        assert data["departments"] == []
        assert data["page"] == 1
        assert data["per_page"] == 20
    
    def test_get_departments_with_data(self, setup_test_db, sample_departments):
        """Test getting departments with data"""
        response = client.get("/api/v1/departments/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 3
        assert len(data["departments"]) == 3
        assert data["page"] == 1
        assert data["per_page"] == 20
        
        # Check first department
        department = data["departments"][0]
        assert "id" in department
        assert "name" in department
        assert "description" in department
        assert "product_count" in department
        assert "created_at" in department
    
    def test_get_departments_pagination(self, setup_test_db, sample_departments):
        """Test departments pagination"""
        # Get first page with 2 items per page
        response = client.get("/api/v1/departments/?page=1&per_page=2")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 3
        assert len(data["departments"]) == 2
        assert data["page"] == 1
        assert data["per_page"] == 2
        assert data["total_pages"] == 2
        
        # Get second page
        response = client.get("/api/v1/departments/?page=2&per_page=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["departments"]) == 1
        assert data["page"] == 2
    
    def test_get_departments_search(self, setup_test_db, sample_departments):
        """Test department search"""
        response = client.get("/api/v1/departments/?search=Electronics")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 1
        assert len(data["departments"]) == 1
        assert "Electronics" in data["departments"][0]["name"]
    
    def test_get_department_by_id(self, setup_test_db, sample_departments):
        """Test getting a specific department by ID"""
        department_id = sample_departments[0].id
        response = client.get(f"/api/v1/departments/{department_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == department_id
        assert data["name"] == "Electronics"
        assert "product_count" in data
    
    def test_get_department_not_found(self, setup_test_db):
        """Test getting non-existent department"""
        response = client.get("/api/v1/departments/99999")
        assert response.status_code == 404
        
        data = response.json()
        assert "not found" in data["detail"].lower()
    
    def test_get_department_products(self, setup_test_db, departments_with_products):
        """Test getting products in a department"""
        electronics_dept = departments_with_products[0]  # Electronics
        response = client.get(f"/api/v1/departments/{electronics_dept.id}/products")
        assert response.status_code == 200
        
        data = response.json()
        assert data["department"]["name"] == "Electronics"
        assert data["total"] == 2  # 2 electronics products
        assert len(data["products"]) == 2
        
        # Check product structure
        product = data["products"][0]
        assert "id" in product
        assert "product_name" in product
        assert "sale_price" in product
    
    def test_get_department_products_pagination(self, setup_test_db, departments_with_products):
        """Test pagination for department products"""
        electronics_dept = departments_with_products[0]
        response = client.get(f"/api/v1/departments/{electronics_dept.id}/products?per_page=1")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total"] == 2
        assert len(data["products"]) == 1
        assert data["total_pages"] == 2
    
    def test_get_department_products_not_found(self, setup_test_db):
        """Test getting products for non-existent department"""
        response = client.get("/api/v1/departments/99999/products")
        assert response.status_code == 404
    
    def test_create_department(self, setup_test_db):
        """Test creating a new department"""
        department_data = {
            "name": "Sports",
            "description": "Sports and outdoor equipment"
        }
        
        response = client.post("/api/v1/departments/", json=department_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == "Sports"
        assert data["description"] == "Sports and outdoor equipment"
        assert data["product_count"] == 0
    
    def test_create_department_duplicate_name(self, setup_test_db, sample_departments):
        """Test creating department with duplicate name"""
        department_data = {
            "name": "Electronics",  # Same as existing department
            "description": "Another electronics department"
        }
        
        response = client.post("/api/v1/departments/", json=department_data)
        assert response.status_code == 400
        
        data = response.json()
        assert "already exists" in data["detail"].lower()
    
    def test_create_department_missing_name(self, setup_test_db):
        """Test creating department without name"""
        department_data = {
            "description": "Department without name"
        }
        
        response = client.post("/api/v1/departments/", json=department_data)
        assert response.status_code == 422  # Validation error
    
    def test_update_department(self, setup_test_db, sample_departments):
        """Test updating a department"""
        department_id = sample_departments[0].id
        update_data = {
            "name": "Consumer Electronics",
            "description": "Updated description for electronics"
        }
        
        response = client.put(f"/api/v1/departments/{department_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Consumer Electronics"
        assert data["description"] == "Updated description for electronics"
    
    def test_update_department_duplicate_name(self, setup_test_db, sample_departments):
        """Test updating department with duplicate name"""
        department_id = sample_departments[0].id
        update_data = {
            "name": "Books"  # Same as another existing department
        }
        
        response = client.put(f"/api/v1/departments/{department_id}", json=update_data)
        assert response.status_code == 400
        
        data = response.json()
        assert "already exists" in data["detail"].lower()
    
    def test_update_department_not_found(self, setup_test_db):
        """Test updating non-existent department"""
        update_data = {
            "name": "Non-existent Department"
        }
        
        response = client.put("/api/v1/departments/99999", json=update_data)
        assert response.status_code == 404
    
    def test_delete_department_empty(self, setup_test_db, sample_departments):
        """Test deleting department without products"""
        # Books department should have no products initially
        books_dept = sample_departments[1]
        
        response = client.delete(f"/api/v1/departments/{books_dept.id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "deleted" in data["message"].lower()
        
        # Verify department is deleted
        response = client.get(f"/api/v1/departments/{books_dept.id}")
        assert response.status_code == 404
    
    def test_delete_department_with_products_no_force(self, setup_test_db, departments_with_products):
        """Test deleting department with products without force flag"""
        electronics_dept = departments_with_products[0]  # Has products
        
        response = client.delete(f"/api/v1/departments/{electronics_dept.id}")
        assert response.status_code == 400
        
        data = response.json()
        assert "cannot delete" in data["detail"].lower()
        assert "force=true" in data["detail"].lower()
    
    def test_delete_department_with_products_force(self, setup_test_db, departments_with_products):
        """Test force deleting department with products"""
        electronics_dept = departments_with_products[0]  # Has products
        
        response = client.delete(f"/api/v1/departments/{electronics_dept.id}?force=true")
        assert response.status_code == 200
        
        data = response.json()
        assert "deleted" in data["message"].lower()
        
        # Verify department is deleted
        response = client.get(f"/api/v1/departments/{electronics_dept.id}")
        assert response.status_code == 404
    
    def test_delete_department_not_found(self, setup_test_db):
        """Test deleting non-existent department"""
        response = client.delete("/api/v1/departments/99999")
        assert response.status_code == 404

class TestDepartmentStats:
    """Test department statistics endpoint"""
    
    def test_get_department_stats(self, setup_test_db, departments_with_products):
        """Test getting department statistics"""
        response = client.get("/api/v1/departments/stats/summary")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_departments"] == 3
        assert "average_products_per_department" in data
        assert "department_breakdown" in data
        
        # Check department breakdown
        breakdown = data["department_breakdown"]
        assert len(breakdown) == 3
        
        # Electronics should have 2 products, Books should have 1, Clothing should have 0
        electronics_breakdown = next(d for d in breakdown if d["name"] == "Electronics")
        assert electronics_breakdown["product_count"] == 2
        
        books_breakdown = next(d for d in breakdown if d["name"] == "Books")
        assert books_breakdown["product_count"] == 1
    
    def test_get_department_stats_empty(self, setup_test_db):
        """Test getting department stats when no departments exist"""
        response = client.get("/api/v1/departments/stats/summary")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_departments"] == 0
        assert data["average_products_per_department"] == 0
        assert data["department_breakdown"] == []
