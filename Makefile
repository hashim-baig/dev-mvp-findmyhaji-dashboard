# FindMyHaji Operations Center - Makefile

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.dev.yml
PROJECT_NAME := findmyhaji

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

##@ Help
help: ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\n🕋 $(GREEN)FindMyHaji Operations Center$(NC)\n\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development
dev: ## Start development environment
	@echo "$(GREEN)🚀 Starting FindMyHaji development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up -d
	@echo "$(GREEN)✅ Development environment started!$(NC)"
	@echo "$(BLUE)📱 Frontend: http://localhost:3000$(NC)"
	@echo "$(BLUE)🔧 Backend API: http://localhost:8001$(NC)"
	@echo "$(BLUE)🗄️  MongoDB: mongodb://localhost:27017$(NC)"

dev-build: ## Build and start development environment
	@echo "$(GREEN)🔨 Building development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up -d --build

dev-logs: ## View development logs
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) logs -f

dev-stop: ## Stop development environment
	@echo "$(YELLOW)⏹️  Stopping development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) down
	@echo "$(GREEN)✅ Development environment stopped!$(NC)"

##@ Production
prod: ## Start production environment
	@echo "$(GREEN)🚀 Starting FindMyHaji production environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Production environment started!$(NC)"

prod-build: ## Build and start production environment
	@echo "$(GREEN)🔨 Building production environment...$(NC)"
	docker-compose up -d --build

prod-logs: ## View production logs
	docker-compose logs -f

prod-stop: ## Stop production environment
	@echo "$(YELLOW)⏹️  Stopping production environment...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Production environment stopped!$(NC)"

##@ Database
db-shell: ## Access MongoDB shell
	@echo "$(BLUE)🗄️  Accessing MongoDB shell...$(NC)"
	docker-compose exec mongodb mongosh "mongodb://admin:findmyhaji123@localhost:27017/findmyhaji?authSource=admin"

db-backup: ## Backup database
	@echo "$(BLUE)💾 Creating database backup...$(NC)"
	docker-compose exec mongodb mongodump --uri="mongodb://admin:findmyhaji123@localhost:27017/findmyhaji?authSource=admin" --out=/data/backup
	@echo "$(GREEN)✅ Database backup completed!$(NC)"

db-restore: ## Restore database from backup
	@echo "$(BLUE)🔄 Restoring database from backup...$(NC)"
	docker-compose exec mongodb mongorestore --uri="mongodb://admin:findmyhaji123@localhost:27017/findmyhaji?authSource=admin" /data/backup/findmyhaji
	@echo "$(GREEN)✅ Database restore completed!$(NC)"

db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "$(RED)⚠️  WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker-compose up -d mongodb
	@echo "$(GREEN)✅ Database reset completed!$(NC)"

##@ Services
backend-shell: ## Access backend container shell
	@echo "$(BLUE)🔧 Accessing backend shell...$(NC)"
	docker-compose exec backend bash

frontend-shell: ## Access frontend container shell
	@echo "$(BLUE)📱 Accessing frontend shell...$(NC)"
	docker-compose exec frontend sh

backend-logs: ## View backend logs
	docker-compose logs -f backend

frontend-logs: ## View frontend logs
	docker-compose logs -f frontend

mongodb-logs: ## View MongoDB logs
	docker-compose logs -f mongodb

##@ Maintenance
status: ## Show services status
	@echo "$(BLUE)📊 Services Status:$(NC)"
	docker-compose ps

health: ## Check services health
	@echo "$(BLUE)🏥 Health Check:$(NC)"
	@echo "Backend API:" && curl -s http://localhost:8001/health || echo "$(RED)❌ Backend unhealthy$(NC)"
	@echo "Frontend:" && curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✅ Frontend healthy$(NC)" || echo "$(RED)❌ Frontend unhealthy$(NC)"
	@echo "MongoDB:" && docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null && echo "$(GREEN)✅ MongoDB healthy$(NC)" || echo "$(RED)❌ MongoDB unhealthy$(NC)"

clean: ## Clean up containers, networks, and volumes
	@echo "$(YELLOW)🧹 Cleaning up Docker resources...$(NC)"
	docker-compose down -v
	docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed!$(NC)"

update: ## Update all services
	@echo "$(BLUE)🔄 Updating services...$(NC)"
	docker-compose pull
	docker-compose up -d --build
	@echo "$(GREEN)✅ Services updated!$(NC)"

##@ Testing
test-backend: ## Run backend tests
	@echo "$(BLUE)🧪 Running backend tests...$(NC)"
	docker-compose exec backend yarn test

test-frontend: ## Run frontend tests
	@echo "$(BLUE)🧪 Running frontend tests...$(NC)"
	docker-compose exec frontend yarn test --watchAll=false

test-all: test-backend test-frontend ## Run all tests

##@ Setup
init: ## Initialize the project (first time setup)
	@echo "$(GREEN)🕋 Initializing FindMyHaji Operations Center...$(NC)"
	cp .env.example .env
	@echo "$(YELLOW)📝 Please update .env file with your configuration$(NC)"
	@echo "$(BLUE)🔨 Building initial containers...$(NC)"
	docker-compose build
	@echo "$(GREEN)✅ Project initialized! Run 'make dev' to start development$(NC)"

install: ## Install/update dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	docker-compose exec backend yarn install
	docker-compose exec frontend yarn install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

##@ Nginx (Production)
nginx: ## Start with Nginx reverse proxy
	@echo "$(GREEN)🌐 Starting with Nginx reverse proxy...$(NC)"
	docker-compose --profile production up -d
	@echo "$(GREEN)✅ Nginx proxy started!$(NC)"
	@echo "$(BLUE)🌐 Access: http://localhost$(NC)"

nginx-stop: ## Stop Nginx and all services
	docker-compose --profile production down

##@ Information
info: ## Show project information
	@echo "$(GREEN)🕋 FindMyHaji Operations Center$(NC)"
	@echo "$(BLUE)Version:$(NC) 3.0.0"
	@echo "$(BLUE)Description:$(NC) Modern admin dashboard for Hajj pilgrimage management"
	@echo ""
	@echo "$(YELLOW)📍 URLs:$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:8001"
	@echo "  MongoDB: mongodb://localhost:27017"
	@echo ""
	@echo "$(YELLOW)🔐 Default Login:$(NC)"
	@echo "  Email: admin@findmyhaji.com"
	@echo "  Password: admin123"
	@echo "  Admin: Khazi Naseeruddin"
	@echo ""
	@echo "$(YELLOW)🛠️  Tech Stack:$(NC)"
	@echo "  Frontend: React 19 + Tailwind CSS"
	@echo "  Backend: Node.js + Express + Socket.IO"
	@echo "  Database: MongoDB"
	@echo "  Containerization: Docker + Docker Compose"

# Phony targets
.PHONY: help dev dev-build dev-logs dev-stop prod prod-build prod-logs prod-stop
.PHONY: db-shell db-backup db-restore db-reset backend-shell frontend-shell
.PHONY: backend-logs frontend-logs mongodb-logs status health clean update
.PHONY: test-backend test-frontend test-all init install nginx nginx-stop info