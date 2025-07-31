import pytest
import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import Product, Department
from database.connection import SessionLocal, create_tables, drop_tables

@pytest.fixture(scope="module")
def db_session():
    """Create a database session for testing"""
    # Use test database
    create_tables()
    session = SessionLocal()
    yield session
    session.close()
    drop_tables()

@pytest.fixture
def sample_department(db_session):
    """Create a sample department for testing"""
    department = Department(
        name="Electronics",
        description="Electronic devices and accessories"
    )
    db_session.add(department)
    db_session.commit()
    db_session.refresh(department)
    return department

@pytest.fixture
def sample_product(db_session, sample_department):
    """Create a sample product for testing"""
    product = Product(
        product_id="TEST001",
        product_name="Test Product",
        category="Test Category",
        sub_category="Test Sub Category",
        brand="Test Brand",
        sale_price=Decimal("99.99"),
        market_price=Decimal("149.99"),
        type="Test Type",
        rating=4.5,
        description="This is a test product",
        department_id=sample_department.id
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product

class TestDepartmentModel:
    """Test cases for Department model"""
    
    def test_department_creation(self, db_session):
        """Test creating a department"""
        department = Department(
            name="Books",
            description="Books and literature"
        )
        
        db_session.add(department)
        db_session.commit()
        
        assert department.id is not None
        assert department.name == "Books"
        assert department.description == "Books and literature"
        assert isinstance(department.created_at, datetime)
        assert isinstance(department.updated_at, datetime)
    
    def test_department_unique_name(self, db_session, sample_department):
        """Test that department names must be unique"""
        duplicate_department = Department(
            name="Electronics",  # Same as sample_department
            description="Another electronics department"
        )
        
        db_session.add(duplicate_department)
        
        with pytest.raises(Exception):  # Should raise integrity error
            db_session.commit()
    
    def test_department_str_representation(self, sample_department):
        """Test department string representation"""
        expected = f"<Department(id={sample_department.id}, name='Electronics')>"
        assert str(sample_department) == expected

class TestProductModel:
    """Test cases for Product model"""
    
    def test_product_creation(self, db_session, sample_department):
        """Test creating a product"""
        product = Product(
            product_id="LAPTOP001",
            product_name="Gaming Laptop",
            category="Computers",
            sub_category="Laptops",
            brand="TechBrand",
            sale_price=Decimal("1299.99"),
            market_price=Decimal("1599.99"),
            type="Gaming",
            rating=4.8,
            description="High-performance gaming laptop",
            department_id=sample_department.id
        )
        
        db_session.add(product)
        db_session.commit()
        
        assert product.id is not None
        assert product.product_id == "LAPTOP001"
        assert product.product_name == "Gaming Laptop"
        assert product.sale_price == Decimal("1299.99")
        assert product.rating == 4.8
        assert product.department_id == sample_department.id
    
    def test_product_unique_product_id(self, db_session, sample_product):
        """Test that product_id must be unique"""
        duplicate_product = Product(
            product_id="TEST001",  # Same as sample_product
            product_name="Another Test Product",
            sale_price=Decimal("50.00")
        )
        
        db_session.add(duplicate_product)
        
        with pytest.raises(Exception):  # Should raise integrity error
            db_session.commit()
    
    def test_product_discount_percentage(self, sample_product):
        """Test discount percentage calculation"""
        # sample_product has sale_price=99.99, market_price=149.99
        expected_discount = round(((149.99 - 99.99) / 149.99) * 100, 2)
        assert sample_product.discount_percentage == expected_discount
    
    def test_product_discount_percentage_no_market_price(self, db_session):
        """Test discount percentage when market_price is None"""
        product = Product(
            product_id="NOMARKET001",
            product_name="No Market Price Product",
            sale_price=Decimal("50.00"),
            market_price=None
        )
        
        assert product.discount_percentage == 0
    
    def test_product_discount_percentage_same_prices(self, db_session):
        """Test discount percentage when prices are the same"""
        product = Product(
            product_id="SAME001",
            product_name="Same Price Product",
            sale_price=Decimal("100.00"),
            market_price=Decimal("100.00")
        )
        
        assert product.discount_percentage == 0
    
    def test_product_department_relationship(self, db_session, sample_product, sample_department):
        """Test product-department relationship"""
        # Test product.department
        assert sample_product.department == sample_department
        
        # Test department.products
        assert sample_product in sample_department.products
    
    def test_product_str_representation(self, sample_product):
        """Test product string representation"""
        expected = f"<Product(id={sample_product.id}, name='Test Product', price={sample_product.sale_price})>"
        assert str(sample_product) == expected

class TestModelValidation:
    """Test model validation and edge cases"""
    
    def test_product_without_department(self, db_session):
        """Test creating product without department"""
        product = Product(
            product_id="NODEPT001",
            product_name="No Department Product",
            sale_price=Decimal("25.00")
        )
        
        db_session.add(product)
        db_session.commit()
        
        assert product.department_id is None
        assert product.department is None
    
    def test_product_negative_price(self, db_session):
        """Test product with negative price (should be allowed by model but validated by API)"""
        product = Product(
            product_id="NEG001",
            product_name="Negative Price Product",
            sale_price=Decimal("-10.00")
        )
        
        db_session.add(product)
        db_session.commit()
        
        assert product.sale_price == Decimal("-10.00")
    
    def test_product_rating_bounds(self, db_session):
        """Test product rating with various values"""
        # Valid rating
        product1 = Product(
            product_id="RATE001",
            product_name="Valid Rating Product",
            rating=3.7
        )
        
        # Rating above 5 (should be allowed by model but validated by API)
        product2 = Product(
            product_id="RATE002",
            product_name="High Rating Product",
            rating=6.5
        )
        
        db_session.add_all([product1, product2])
        db_session.commit()
        
        assert product1.rating == 3.7
        assert product2.rating == 6.5
    
    def test_department_empty_description(self, db_session):
        """Test department with empty description"""
        department = Department(
            name="Empty Description Dept",
            description=""
        )
        
        db_session.add(department)
        db_session.commit()
        
        assert department.description == ""
    
    def test_department_null_description(self, db_session):
        """Test department with null description"""
        department = Department(
            name="Null Description Dept",
            description=None
        )
        
        db_session.add(department)
        db_session.commit()
        
        assert department.description is None

class TestModelQueries:
    """Test model queries and database operations"""
    
    def test_query_products_by_department(self, db_session, sample_department, sample_product):
        """Test querying products by department"""
        products = db_session.query(Product).filter(
            Product.department_id == sample_department.id
        ).all()
        
        assert len(products) == 1
        assert products[0] == sample_product
    
    def test_query_products_by_price_range(self, db_session):
        """Test querying products by price range"""
        # Create products with different prices
        products = [
            Product(product_id="CHEAP001", product_name="Cheap Product", sale_price=Decimal("10.00")),
            Product(product_id="MID001", product_name="Mid Product", sale_price=Decimal("50.00")),
            Product(product_id="EXP001", product_name="Expensive Product", sale_price=Decimal("100.00"))
        ]
        
        db_session.add_all(products)
        db_session.commit()
        
        # Query products between $25 and $75
        filtered_products = db_session.query(Product).filter(
            Product.sale_price >= 25,
            Product.sale_price <= 75
        ).all()
        
        assert len(filtered_products) == 1
        assert filtered_products[0].product_name == "Mid Product"
    
    def test_query_products_by_rating(self, db_session):
        """Test querying products by rating"""
        # Create products with different ratings
        products = [
            Product(product_id="LOW001", product_name="Low Rating", rating=2.5),
            Product(product_id="HIGH001", product_name="High Rating", rating=4.8),
            Product(product_id="MID001", product_name="Mid Rating", rating=3.5)
        ]
        
        db_session.add_all(products)
        db_session.commit()
        
        # Query products with rating >= 4.0
        high_rated = db_session.query(Product).filter(
            Product.rating >= 4.0
        ).all()
        
        assert len(high_rated) == 1
        assert high_rated[0].product_name == "High Rating"
    
    def test_search_products_by_name(self, db_session):
        """Test searching products by name"""
        # Create products with searchable names
        products = [
            Product(product_id="LAPTOP001", product_name="Gaming Laptop"),
            Product(product_id="PHONE001", product_name="Smartphone"),
            Product(product_id="TABLET001", product_name="Tablet Device")
        ]
        
        db_session.add_all(products)
        db_session.commit()
        
        # Search for products containing "Laptop"
        search_results = db_session.query(Product).filter(
            Product.product_name.ilike("%Laptop%")
        ).all()
        
        assert len(search_results) == 1
        assert search_results[0].product_name == "Gaming Laptop"
