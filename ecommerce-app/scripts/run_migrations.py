#!/usr/bin/env python3

import sys
import os
from pathlib import Path
import subprocess
from alembic.config import Config
from alembic import command

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent))

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_migrations():
    """Run database migrations using Alembic"""
    
    try:
        logger.info("🚀 Starting database migrations...")
        
        # Get the alembic.ini path
        alembic_cfg_path = Path(__file__).parent.parent / "alembic.ini"
        
        if not alembic_cfg_path.exists():
            logger.error(f"❌ Alembic config file not found at {alembic_cfg_path}")
            return False
        
        # Create Alembic configuration
        alembic_cfg = Config(str(alembic_cfg_path))
        
        # Run migrations
        logger.info("📊 Running database migrations...")
        command.upgrade(alembic_cfg, "head")
        
        logger.info("✅ Database migrations completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error running migrations: {e}")
        return False

def create_migration(message: str = None, autogenerate: bool = True):
    """Create a new migration"""
    
    try:
        if not message:
            message = input("Enter migration message: ").strip()
        
        if not message:
            logger.error("❌ Migration message is required")
            return False
        
        logger.info(f"📝 Creating new migration: {message}")
        
        # Get the alembic.ini path
        alembic_cfg_path = Path(__file__).parent.parent / "alembic.ini"
        alembic_cfg = Config(str(alembic_cfg_path))
        
        # Create migration
        command.revision(
            alembic_cfg, 
            message=message, 
            autogenerate=autogenerate
        )
        
        logger.info("✅ Migration created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating migration: {e}")
        return False

def get_migration_history():
    """Get migration history"""
    
    try:
        logger.info("📋 Getting migration history...")
        
        alembic_cfg_path = Path(__file__).parent.parent / "alembic.ini"
        alembic_cfg = Config(str(alembic_cfg_path))
        
        # This would show the history - for now just log
        logger.info("✅ Check your database for migration history")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error getting migration history: {e}")
        return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Database migration management")
    parser.add_argument("action", choices=["upgrade", "create", "history"], 
                       help="Migration action to perform")
    parser.add_argument("--message", "-m", help="Migration message (for create action)")
    parser.add_argument("--no-autogenerate", action="store_true", 
                       help="Don't use autogenerate for create action")
    
    args = parser.parse_args()
    
    if args.action == "upgrade":
        success = run_migrations()
    elif args.action == "create":
        success = create_migration(
            message=args.message, 
            autogenerate=not args.no_autogenerate
        )
    elif args.action == "history":
        success = get_migration_history()
    else:
        logger.error(f"❌ Unknown action: {args.action}")
        success = False
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
