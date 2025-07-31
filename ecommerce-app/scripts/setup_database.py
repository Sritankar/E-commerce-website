#!/usr/bin/env python3

import sys
import os
from pathlib import Path

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from database.connection import create_tables, drop_tables, SessionLocal
from database.seeds.load_csv_data import DataLoader
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database(reset: bool = False):
    """Setup database tables and load initial data"""
    
    logger.info("🚀 Setting up E-Commerce Database...")
    
    try:
        if reset:
            logger.info("📊 Dropping existing tables...")
            drop_tables()
        
        # Create tables
        logger.info("📊 Creating database tables...")
        create_tables()
        logger.info("✅ Database tables created successfully!")
        
        # Load initial data
        logger.info("📁 Loading initial data from CSV...")
        loader = DataLoader()
        
        # Analyze CSV first
        analysis = loader.analyze_csv()
        if not analysis:
            logger.error("❌ Failed to analyze CSV file")
            return False
        
        # Load products
        success = loader.load_products()
        if not success:
            logger.error("❌ Failed to load products")
            return False
        
        # Verify data
        stats = loader.verify_data()
        logger.info(f"📊 Data verification: {stats}")
        
        logger.info("🎉 Database setup completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error setting up database: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Setup E-Commerce Database")
    parser.add_argument("--reset", action="store_true", help="Reset database (drop and recreate tables)")
    
    args = parser.parse_args()
    
    success = setup_database(reset=args.reset)
    
    if success:
        print("\n✅ Database setup completed successfully!")
        print("🚀 You can now start the API server:")
        print("   python -m uvicorn api.app:app --reload")
    else:
        print("\n❌ Database setup failed!")
        sys.exit(1)
