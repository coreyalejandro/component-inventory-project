
# GitInventory

A comprehensive GitHub repository inventory system that scans repositories and provides detailed analysis of files, dependencies, vulnerabilities, issues, and metadata through a secure REST API and modern web dashboard.

## 🚀 Features

- **Repository Scanning**: Complete inventory of files, languages, and code metrics
- **Dependency Analysis**: Parse and resolve direct/transitive dependencies from multiple ecosystems
- **Vulnerability Detection**: Cross-reference dependencies against GitHub Advisory Database and OSV
- **Metadata Collection**: Issues, PRs, releases, branches, tags, and repository information
- **Secure API**: OAuth 2.0 authentication, JWT service tokens, and RBAC
- **Modern Dashboard**: Next.js frontend with real-time scanning and reporting
- **Observability**: Structured logging, metrics, tracing, and health monitoring

## 🏗️ Architecture

### System Architecture Diagram
![GitInventory Architecture](./docs/GitInventory-Architecture-2025-08-30.svg)

### System Flow Diagram
```mermaid
flowchart LR
  User["👩‍💻 User Browser<br/>Next.js Dashboard (3001)"] 
    --> FE["Frontend (Next.js App Router)<br/>/api/scan, /api/inventory"]

  FE --> BE["Backend (Fastify API + Workers)<br/>/v1/repos/scan, /v1/.../inventory<br/>/oauth/github/login → JWT<br/>BullMQ + Redis, Postgres"]

  BE -->|Queue| Redis[(Redis Queue)]
  BE -->|Store| Postgres[(Postgres DB)]
  BE -->|Scan repos| GitHub["GitHub APIs<br/>REST v3 + GraphQL v4"]
  BE -->|Vulns| OSV["OSV API<br/>Vulnerability Lookup"]

  classDef service fill:#fff,stroke:#111,stroke-width:2px,rx:12
  classDef infra fill:#f6f6f6,stroke:#111,stroke-width:1.5px,rx:10

  class User,FE,BE service
  class Redis,Postgres,GitHub,OSV infra
```

### Technology Stack
- **Backend**: Node.js + TypeScript + Fastify
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with migrations
- **Cache**: Redis for performance optimization
- **Queue**: BullMQ for background scanning tasks
- **Container**: Docker and Docker Compose for deployment

## 📋 Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14
- Redis ≥ 6
- Docker and Docker Compose (optional)

## 🛠️ Installation

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd component-inventory-project

# Start all services
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/docs
```

### Manual Installation

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   # Edit frontend/.env.local with your configuration
   ```

3. **Set up the database:**
   ```bash
   cd backend
   npm run migrate
   ```

4. **Start the development servers:**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately
   npm run dev:backend  # Backend on port 3000
   npm run dev:frontend # Frontend on port 3001
   ```

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gitinventory

# Redis
REDIS_URL=redis://localhost:6379

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT
JWT_SECRET=your_jwt_secret

# Security
CORS_ORIGIN=http://localhost:3001
```

### Frontend Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:

- **Swagger UI**: http://localhost:3000/docs
- **ReDoc**: http://localhost:3000/docs/redoc

### Key Endpoints

- `GET /v1/healthz` - Health check
- `POST /v1/repos/scan` - Enqueue repository scan
- `GET /v1/repos/{owner}/{repo}/inventory` - Get repository inventory
- `GET /v1/reports/{id}` - Get signed inventory report

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

## 📦 Building for Production

```bash
# Build both applications
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. Build the applications:
   ```bash
   npm run build
   ```

2. Set up production environment variables

3. Start the services:
   ```bash
   npm run start
   ```

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Health Checks**: `/v1/healthz` and `/v1/readyz`
- **Metrics**: Prometheus metrics at `/metrics`
- **Logging**: Structured JSON logs with Pino
- **Tracing**: OpenTelemetry distributed tracing

## 🔒 Security

- OAuth 2.0 authentication with GitHub
- JWT service tokens for API access
- Role-based access control (RBAC)
- Rate limiting and request validation
- Secrets management with environment variables
- CORS configuration
- Helmet.js security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the API documentation at `/docs`
2. Review the logs for error details
3. Open an issue on GitHub

## 📈 Roadmap

- [ ] Support for additional Git hosts (GitLab, Bitbucket)
- [ ] Advanced vulnerability scanning
- [ ] Custom report templates
- [ ] Team collaboration features
- [ ] Advanced analytics and dashboards
- [ ] CI/CD integration
- [ ] Mobile application
