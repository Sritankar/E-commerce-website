#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting E-Commerce Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔄 Killing process on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check for required commands
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is required but not installed.${NC}"
    exit 1
fi

if ! command_exists pip; then
    echo -e "${RED}❌ pip is required but not installed.${NC}"
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}❌ Python $required_version or higher is required. You have $python_version${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python $python_version found${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${BLUE}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment found${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${BLUE}⬆️ Upgrading pip...${NC}"
pip install --upgrade pip

# Install Python dependencies
echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
else
    echo -e "${RED}❌ requirements.txt not found${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ .env file not found. Creating from template...${NC}"
    cat > .env << EOF
# Database Configuration
DATABASE_URL=sqlite:///./ecommerce.db
TEST_DATABASE_URL=sqlite:///./test.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
RELOAD=True

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# File Paths
CSV_PATH=data/products.csv
UPLOAD_PATH=uploads/

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p data logs uploads

# Check if database exists and set it up
if [ ! -f "ecommerce.db" ]; then
    echo -e "${BLUE}📊 Setting up database...${NC}"
    
    # Run migrations first
    if [ -f "alembic.ini" ]; then
        echo -e "${BLUE}🔄 Running database migrations...${NC}"
        python scripts/run_migrations.py upgrade || echo -e "${YELLOW}⚠️ Migration failed, continuing...${NC}"
    fi
    
    # Setup database
    python scripts/setup_database.py
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️ Database setup had issues, but continuing...${NC}"
    fi
else
    echo -e "${GREEN}✅ Database already exists${NC}"
fi

# Check if API port is available
API_PORT=8000
if check_port $API_PORT; then
    echo -e "${YELLOW}⚠️ Port $API_PORT is already in use${NC}"
    read -p "Do you want to kill the process on port $API_PORT? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $API_PORT
    else
        echo -e "${RED}❌ Cannot start API server on port $API_PORT${NC}"
        exit 1
    fi
fi

# Start API server in background
echo -e "${BLUE}🌐 Starting API server...${NC}"
python -m uvicorn api.app:app --reload --host 0.0.0.0 --port $API_PORT &
API_PID=$!

# Wait a moment for server to start
sleep 3

# Check if API server started successfully
if ! check_port $API_PORT; then
    echo -e "${RED}❌ Failed to start API server${NC}"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ API server started on port $API_PORT${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $API_PID 2>/dev/null || true
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Node.js is installed for frontend
FRONTEND_PID=""
if command_exists node && command_exists npm; then
    echo -e "${GREEN}✅ Node.js found${NC}"
    
    if [ -d "frontend" ]; then
        cd frontend
        
        # Install npm dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
            npm install
            echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
        else
            echo -e "${GREEN}✅ Frontend dependencies found${NC}"
        fi
        
        # Check if frontend port is available
        FRONTEND_PORT=3000
        if check_port $FRONTEND_PORT; then
            echo -e "${YELLOW}⚠️ Port $FRONTEND_PORT is already in use${NC}"
            read -p "Do you want to kill the process on port $FRONTEND_PORT? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill_port $FRONTEND_PORT
            else
                echo -e "${YELLOW}⚠️ Skipping frontend server startup${NC}"
                cd ..
                frontend_started=false
            fi
        fi
        
        if [ "$frontend_started" != "false" ]; then
            # Start frontend development server
            echo -e "${BLUE}🎨 Starting frontend server...${NC}"
            npm start &
            FRONTEND_PID=$!
            
            # Wait a moment for frontend to start
            sleep 5
            
            if check_port $FRONTEND_PORT; then
                echo -e "${GREEN}✅ Frontend server started on port $FRONTEND_PORT${NC}"
            else
                echo -e "${YELLOW}⚠️ Frontend server may not have started properly${NC}"
            fi
        fi
        
        cd ..
    else
        echo -e "${YELLOW}⚠️ Frontend directory not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Node.js not found. Skipping frontend setup.${NC}"
    echo -e "${BLUE}💡 Install Node.js to run the frontend development server${NC}"
fi

# Display startup information
echo ""
echo -e "${GREEN}🎉 Development environment started successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Server Information:${NC}"
echo -e "   📖 API Documentation: ${GREEN}http://localhost:$API_PORT/docs${NC}"
echo -e "   🌐 API Server: ${GREEN}http://localhost:$API_PORT${NC}"
echo -e "   🔍 API Health Check: ${GREEN}http://localhost:$API_PORT/health${NC}"

if [ ! -z "$FRONTEND_PID" ] && check_port 3000; then
    echo -e "   🎨 Frontend: ${GREEN}http://localhost:3000${NC}"
fi

echo ""
echo -e "${BLUE}📁 Important Files:${NC}"
echo -e "   📊 Database: ${YELLOW}ecommerce.db${NC}"
echo -e "   📝 Logs: ${YELLOW}logs/app.log${NC}"
echo -e "   ⚙️ Config: ${YELLOW}.env${NC}"

echo ""
echo -e "${BLUE}🛠️ Development Commands:${NC}"
echo -e "   📊 Load sample data: ${YELLOW}python scripts/load_data.py${NC}"
echo -e "   🔄 Run migrations: ${YELLOW}python scripts/run_migrations.py upgrade${NC}"
echo -e "   🧪 Run tests: ${YELLOW}pytest tests/${NC}"

echo ""
echo -e "${RED}Press Ctrl+C to stop all servers${NC}"

# Wait for user interrupt
wait
