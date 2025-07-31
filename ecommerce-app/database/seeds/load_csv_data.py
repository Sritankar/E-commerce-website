import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from database.models import Product, Department
from database.connection import SessionLocal
import os
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self, csv_path: str = "data/products.csv"):
        self.csv_path = csv_path
        self.db = SessionLocal()
    
    def analyze_csv(self) -> Dict:
        """Analyze CSV structure and data quality"""
        try:
            df = pd.read_csv(self.csv_path, nrows=1000)  # Sample for analysis
            
            analysis = {
                "total_rows": len(df),
                "columns": list(df.columns),
                "data_types": df.dtypes.to_dict(),
                "missing_values": df.isnull().sum().to_dict(),
                "sample_data": df.head().to_dict('records')
            }
            
            logger.info(f"CSV Analysis: {analysis}")
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing CSV: {e}")
            return {}
    
    def create_departments_from_categories(self, df: pd.DataFrame) -> Dict[str, int]:
        """Create departments from unique categories"""
        unique_categories = df['category'].dropna().unique()
        department_mapping = {}
        
        for category in unique_categories:
            # Check if department already exists
            dept = self.db.query(Department).filter(Department.name == category).first()
            if not dept:
                dept = Department(
                    name=category,
                    description=f"Department for {category} products"
                )
                self.db.add(dept)
                self.db.flush()  # Get the ID without committing
            
            department_mapping[category] = dept.id
        
        self.db.commit()
        logger.info(f"Created {len(department_mapping)} departments")
        return department_mapping
    
    def clean_and_transform_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and transform the data"""
        # Handle missing values
        df = df.fillna({
            'product_name': 'Unknown Product',
            'category': 'Uncategorized',
            'sub_category': '',
            'brand': 'Unknown Brand',
            'sale_price': 0,
            'market_price': 0,
            'type': '',
            'rating': 0,
            'description': ''
        })
        
        # Clean price columns
        if 'sale_price' in df.columns:
            df['sale_price'] = pd.to_numeric(df['sale_price'].astype(str).str.replace('[₹,]', '', regex=True), errors='coerce')
        if 'market_price' in df.columns:
            df['market_price'] = pd.to_numeric(df['market_price'].astype(str).str.replace('[₹,]', '', regex=True), errors='coerce')
        
        # Clean rating column
        if 'rating' in df.columns:
            df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
            df['rating'] = df['rating'].clip(0, 5)  # Ensure ratings are between 0-5
        
        # Generate product_id if not exists
        if 'uniq_id' not in df.columns:
            df['product_id'] = df.index.astype(str).str.zfill(6)
        else:
            df['product_id'] = df['uniq_id'].astype(str)
        
        # Truncate long text fields
        df['product_name'] = df['product_name'].astype(str).str[:500]
        df['category'] = df['category'].astype(str).str[:255]
        df['sub_category'] = df['sub_category'].astype(str).str[:255]
        df['brand'] = df['brand'].astype(str).str[:255]
        
        return df
    
    def load_products(self, batch_size: int = 1000) -> bool:
        """Load products from CSV in batches"""
        try:
            if not os.path.exists(self.csv_path):
                logger.error(f"CSV file not found: {self.csv_path}")
                return False
            
            # Read and analyze CSV
            df = pd.read_csv(self.csv_path)
            logger.info(f"Loading {len(df)} products from CSV")
            
            # Clean and transform data
            df = self.clean_and_transform_data(df)
            
            # Create departments from categories
            department_mapping = self.create_departments_from_categories(df)
            
            # Add department_id to dataframe
            df['department_id'] = df['category'].map(department_mapping)
            
            # Column mapping from CSV to database
            column_mapping = {
                'product_id': 'product_id',
                'product_name': 'product_name',
                'category': 'category',
                'sub_category': 'sub_category',
                'brand': 'brand',
                'sale_price': 'sale_price',
                'market_price': 'market_price',
                'type': 'type',
                'rating': 'rating',
                'description': 'description',
                'department_id': 'department_id'
            }
            
            # Prepare data for insertion
            products_data = []
            for _, row in df.iterrows():
                product_data = {}
                for csv_col, db_col in column_mapping.items():
                    if csv_col in df.columns:
                        value = row[csv_col]
                        # Handle NaN values
                        if pd.isna(value):
                            value = None if db_col in ['sale_price', 'market_price', 'rating', 'department_id'] else ''
                        product_data[db_col] = value
                
                products_data.append(product_data)
            
            # Insert in batches
            for i in range(0, len(products_data), batch_size):
                batch = products_data[i:i + batch_size]
                
                # Convert to Product objects
                products = [Product(**product_data) for product_data in batch]
                
                self.db.add_all(products)
                self.db.commit()
                
                logger.info(f"Inserted batch {i//batch_size + 1}/{(len(products_data)-1)//batch_size + 1}")
            
            logger.info(f"Successfully loaded {len(products_data)} products")
            return True
            
        except Exception as e:
            logger.error(f"Error loading products: {e}")
            self.db.rollback()
            return False
        finally:
            self.db.close()
    
    def verify_data(self) -> Dict:
        """Verify loaded data"""
        try:
            stats = {
                "total_products": self.db.query(Product).count(),
                "total_departments": self.db.query(Department).count(),
                "products_with_departments": self.db.query(Product).filter(Product.department_id.isnot(None)).count(),
                "average_price": float(self.db.query(func.avg(Product.sale_price)).scalar() or 0),
                "price_range": {
                    "min": float(self.db.query(func.min(Product.sale_price)).scalar() or 0),
                    "max": float(self.db.query(func.max(Product.sale_price)).scalar() or 0)
                }
            }
            
            logger.info(f"Data verification: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error verifying data: {e}")
            return {}
        finally:
            self.db.close()

if __name__ == "__main__":
    loader = DataLoader()
    
    # Analyze CSV
    analysis = loader.analyze_csv()
    
    # Load products
    success = loader.load_products()
    
    if success:
        # Verify data
        stats = loader.verify_data()
        print("✅ Data loading completed successfully!")
    else:
        print("❌ Data loading failed!")
