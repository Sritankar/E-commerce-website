#!/usr/bin/env python3

import sys
import os
from pathlib import Path

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent))

from database.seeds.load_csv_data import DataLoader
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Load data from CSV into the database"""
    
    logger.info("🚀 Starting data loading process...")
    
    try:
        # Initialize data loader
        loader = DataLoader()
        
        # Analyze CSV structure
        logger.info("📊 Analyzing CSV structure...")
        analysis = loader.analyze_csv()
        
        if not analysis:
            logger.error("❌ Failed to analyze CSV file")
            return False
        
        logger.info(f"✅ CSV analysis complete: {len(analysis.get('columns', []))} columns found")
        
        # Load products
        logger.info("📦 Loading products from CSV...")
        success = loader.load_products()
        
        if not success:
            logger.error("❌ Failed to load products")
            return False
        
        # Verify data
        logger.info("🔍 Verifying loaded data...")
        stats = loader.verify_data()
        
        logger.info("📊 Data loading statistics:")
        logger.info(f"   - Total products: {stats.get('total_products', 0)}")
        logger.info(f"   - Total departments: {stats.get('total_departments', 0)}")
        logger.info(f"   - Products with departments: {stats.get('products_with_departments', 0)}")
        logger.info(f"   - Average price: ${stats.get('average_price', 0):.2f}")
        
        logger.info("🎉 Data loading completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error during data loading: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Load data from CSV into database")
    parser.add_argument("--csv-path", help="Path to CSV file", default="data/products.csv")
    
    args = parser.parse_args()
    
    # Update CSV path if provided
    if args.csv_path:
        os.environ["CSV_PATH"] = args.csv_path
    
    success = main()
    
    if not success:
        sys.exit(1)
