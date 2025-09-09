# 🕋 FindMyHaji Operations Center

Modern admin dashboard for managing Hajj pilgrimage operations with real-time tracking, family communications, and comprehensive management tools.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose v2.0+
- Git
- 8GB+ RAM recommended

### 1. Clone & Setup
```bash
# Clone the repository (or extract files)
git clone <your-repo> findmyhaji
cd findmyhaji

# Create environment file
cp .env.example .env
```

### 2. Development Mode
```bash
# Start all services in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Production Mode
```bash
# Start all services in production mode
docker-compose up -d

# View logs
docker-compose logs -f backend frontend

# Stop services
docker-compose down
```

## 📱 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React Admin Dashboard |
| **Backend API** | http://localhost:8001 | Node.js REST API |
| **Database** | mongodb://localhost:27017 | MongoDB Database |
| **API Docs** | http://localhost:8001/api | API Endpoints |

## 🔐 Default Login Credentials

```
Email: admin@findmyhaji.com
Password: admin123
Admin: Khazi Naseeruddin
```

## 🛠️ Development Commands

### Docker Commands
```bash
# Build all images
docker-compose build

# Start specific service
docker-compose up frontend
docker-compose up backend
docker-compose up mongodb

# View container logs
docker-compose logs -f [service-name]

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend yarn add package-name

# Reset database
docker-compose down -v
docker-compose up -d mongodb
```

### Backend Commands (inside container)
```bash
# Install new package
docker-compose exec backend yarn add package-name

# Run tests
docker-compose exec backend yarn test

# Check API health
curl http://localhost:8001/health
```

### Frontend Commands (inside container)
```bash
# Install new package
docker-compose exec frontend yarn add package-name

# Build for production
docker-compose exec frontend yarn build
```

## 📁 Project Structure

```
findmyhaji/
├── docker-compose.yml          # Main Docker Compose file
├── docker-compose.dev.yml      # Development overrides
├── .env                        # Environment variables
├── README.md                   # This file
├── backend/                    # Node.js Backend
│   ├── Dockerfile             # Production Dockerfile
│   ├── Dockerfile.dev         # Development Dockerfile
│   ├── server.js              # Main server file
│   ├── routes/                # API routes
│   ├── models/                # MongoDB models
│   └── package.json           # Backend dependencies
├── frontend/                   # React Frontend
│   ├── Dockerfile             # Production Dockerfile
│   ├── Dockerfile.dev         # Development Dockerfile
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
└── mongo-init/                 # MongoDB initialization scripts
```

## 🎯 Key Features

### 📊 Dashboard Features
- **Real-time Pilgrim Tracking** with GPS locations
- **Family Communication Hub** with automated messaging
- **Journey Timeline** with milestone tracking
- **Analytics & Reports** with interactive charts
- **Employee Management** with multi-step onboarding
- **Emergency Response System** with instant alerts

### 🔧 Technical Features
- **Node.js + Express** REST API backend
- **React 19** modern frontend with hooks
- **MongoDB** for data persistence
- **Socket.IO** for real-time communications
- **JWT Authentication** with role-based access
- **File Upload** support with validation
- **Responsive Design** for mobile and desktop

## 🌍 Environment Variables

### Required Variables
```env
# Database
MONGO_URL=mongodb://admin:findmyhaji123@mongodb:27017/findmyhaji?authSource=admin
DB_NAME=findmyhaji

# Backend
NODE_ENV=development
PORT=8001
JWT_SECRET=your-secret-key

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Optional Variables
```env
# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# SMS (Twilio for messaging)
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
```

## 🔧 Troubleshooting

### Common Issues

#### Services won't start
```bash
# Check Docker status
docker --version
docker-compose --version

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :8001
netstat -tulpn | grep :27017

# Reset everything
docker-compose down -v
docker system prune -a
docker-compose up --build
```

#### Database connection issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh "mongodb://admin:findmyhaji123@localhost:27017/findmyhaji?authSource=admin"
```

#### Frontend/Backend not communicating
```bash
# Check network
docker network ls
docker network inspect findmyhaji_findmyhaji-network

# Restart services
docker-compose restart backend frontend
```

## 📈 Performance Tips

### Development
- Use `.dockerignore` to exclude unnecessary files
- Enable hot reload for faster development
- Use volume mounts for code changes

### Production
- Build optimized images
- Use multi-stage builds
- Enable compression and caching
- Monitor resource usage

## 🔒 Security Considerations

### Development
- Change default database credentials
- Use environment variables for secrets
- Enable CORS only for known origins

### Production
- Use strong JWT secrets
- Enable HTTPS with SSL certificates
- Implement rate limiting
- Regular security updates

## 📞 Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Verify environment variables
- Ensure ports are not in use
- Check Docker Desktop status

## 🕋 Islamic Context

This system is designed specifically for Hajj pilgrimage management:
- **Real-time tracking** of pilgrims during sacred journey
- **Family communication** to keep loved ones informed
- **Emergency response** for pilgrim safety
- **Journey milestones** tracking (Tawaf, Sa'i, Arafat, etc.)
- **Islamic calendar** integration
- **Multi-language support** including Arabic

---

**بِسْمِ ٱللَّٰهِ** - Built with dedication for serving the pilgrims of Allah 🕋