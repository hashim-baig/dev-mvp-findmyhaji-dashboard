#!/bin/bash

# FindMyHaji Operations Center Setup Script
# This script helps you set up the project on your local machine

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="FindMyHaji Operations Center"
VERSION="3.0.0"

echo -e "${GREEN}🕋 ${PROJECT_NAME} - Setup Script${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    echo -e "${BLUE}🐳 Checking Docker installation...${NC}"
    
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop first.${NC}"
        echo -e "${YELLOW}📥 Download from: https://www.docker.com/products/docker-desktop${NC}"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        echo -e "${RED}❌ Docker Compose is not installed.${NC}"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker is installed and running${NC}"
    docker --version
    docker-compose --version
    echo ""
}

# Function to setup environment file
setup_env() {
    echo -e "${BLUE}📝 Setting up environment configuration...${NC}"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Created .env file from template${NC}"
        else
            echo -e "${YELLOW}⚠️  .env.example not found, creating basic .env file${NC}"
            cat > .env << EOF
# FindMyHaji Environment Variables
MONGO_URL=mongodb://admin:findmyhaji123@mongodb:27017/findmyhaji?authSource=admin
DB_NAME=findmyhaji
NODE_ENV=development
PORT=8001
JWT_SECRET=findmyhaji_jwt_secret_key_2025
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
        fi
    else
        echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
    fi
    echo ""
}

# Function to create necessary directories
create_directories() {
    echo -e "${BLUE}📁 Creating necessary directories...${NC}"
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p mongo-data
    mkdir -p nginx/ssl
    
    echo -e "${GREEN}✅ Directories created${NC}"
    echo ""
}

# Function to generate SSL certificates for development
generate_ssl() {
    echo -e "${BLUE}🔒 Generating SSL certificates for development...${NC}"
    
    if [ ! -f nginx/ssl/cert.pem ]; then
        # Generate self-signed certificate for development
        openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/C=SA/ST=Makkah/L=Makkah/O=FindMyHaji/CN=localhost" >/dev/null 2>&1
        echo -e "${GREEN}✅ SSL certificates generated${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL certificates already exist${NC}"
    fi
    echo ""
}

# Function to build Docker images
build_images() {
    echo -e "${BLUE}🔨 Building Docker images...${NC}"
    echo -e "${YELLOW}⏳ This may take a few minutes on first run...${NC}"
    
    docker-compose build --parallel
    
    echo -e "${GREEN}✅ Docker images built successfully${NC}"
    echo ""
}

# Function to start services
start_services() {
    echo -e "${BLUE}🚀 Starting FindMyHaji services...${NC}"
    
    # Start in development mode
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    echo -e "${GREEN}✅ Services started successfully${NC}"
    echo ""
}

# Function to wait for services to be ready
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    
    # Wait for backend
    echo -n "Backend API: "
    for i in {1..30}; do
        if curl -s http://localhost:8001/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    # Wait for frontend
    echo -n "Frontend: "
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    echo ""
}

# Function to show final information
show_info() {
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📍 Access URLs:${NC}"
    echo -e "  🌐 Frontend (Admin Dashboard): ${BLUE}http://localhost:3000${NC}"
    echo -e "  🔧 Backend API: ${BLUE}http://localhost:8001${NC}"
    echo -e "  🗄️  MongoDB: ${BLUE}mongodb://localhost:27017${NC}"
    echo ""
    echo -e "${YELLOW}🔐 Default Login Credentials:${NC}"
    echo -e "  📧 Email: ${BLUE}admin@findmyhaji.com${NC}"
    echo -e "  🔑 Password: ${BLUE}admin123${NC}"
    echo -e "  👤 Admin: ${BLUE}Khazi Naseeruddin${NC}"
    echo ""
    echo -e "${YELLOW}🛠️  Useful Commands:${NC}"
    echo -e "  View logs: ${BLUE}docker-compose logs -f${NC}"
    echo -e "  Stop services: ${BLUE}docker-compose down${NC}"
    echo -e "  Restart services: ${BLUE}docker-compose restart${NC}"
    echo -e "  View status: ${BLUE}docker-compose ps${NC}"
    echo ""
    echo -e "${YELLOW}📚 Documentation:${NC}"
    echo -e "  README.md contains detailed information"
    echo -e "  Makefile contains helpful commands"
    echo ""
    echo -e "${GREEN}🕋 Bismillah - FindMyHaji Operations Center is ready!${NC}"
}

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    docker-compose down >/dev/null 2>&1 || true
}

# Function to check system requirements
check_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    # Check available memory (at least 4GB recommended)
    if command_exists free; then
        TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
        if [ "$TOTAL_MEM" -lt 4 ]; then
            echo -e "${YELLOW}⚠️  Warning: Less than 4GB RAM available. Performance may be affected.${NC}"
        fi
    fi
    
    # Check available disk space (at least 5GB recommended)
    AVAILABLE_SPACE=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 5 ]; then
        echo -e "${YELLOW}⚠️  Warning: Less than 5GB disk space available.${NC}"
    fi
    
    echo -e "${GREEN}✅ System requirements check completed${NC}"
    echo ""
}

# Main setup function
main() {
    echo -e "${BLUE}🚀 Starting setup process...${NC}"
    echo ""
    
    # Trap cleanup function on script exit
    trap cleanup EXIT
    
    # Run all setup steps
    check_requirements
    check_docker
    setup_env
    create_directories
    
    # Ask user about SSL certificates
    read -p "Generate SSL certificates for HTTPS? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists openssl; then
            generate_ssl
        else
            echo -e "${YELLOW}⚠️  OpenSSL not found, skipping SSL certificate generation${NC}"
        fi
    fi
    
    build_images
    start_services
    wait_for_services
    show_info
    
    # Remove trap for successful completion
    trap - EXIT
}

# Check if script is run from correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    echo -e "${YELLOW}Expected to find docker-compose.yml in current directory${NC}"
    exit 1
fi

# Run main function
main

# Ask if user wants to open the application
echo ""
read -p "Open FindMyHaji Admin Dashboard in browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command_exists xdg-open; then
        xdg-open http://localhost:3000
    elif command_exists open; then
        open http://localhost:3000
    elif command_exists start; then
        start http://localhost:3000
    else
        echo -e "${YELLOW}Please open ${BLUE}http://localhost:3000${NC} ${YELLOW}in your browser${NC}"
    fi
fi

echo -e "${GREEN}🎉 Setup completed! Enjoy using FindMyHaji Operations Center!${NC}"