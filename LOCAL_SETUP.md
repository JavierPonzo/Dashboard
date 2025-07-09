# Local Development Setup

This guide will help you set up the Legal Compliance Automation Platform for local development.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn package manager
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd compliance-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start PostgreSQL (using Docker)
docker-compose up -d postgres

# 5. Set up database schema
npm run db:push

# 6. Start development server
npm run dev
```

## Detailed Setup

### 1. PostgreSQL Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Verify database is running
docker ps

# Connect to database (optional)
docker exec -it compliance-platform_postgres_1 psql -U postgres -d compliance_db
```

#### Option B: Local PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
createdb compliance_db
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb compliance_db
```

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install and start the service
3. Use pgAdmin or command line to create database

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/compliance_db

# OpenAI Configuration (required for AI features)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Session Configuration
SESSION_SECRET=your_very_long_random_string_here

# Optional: Replit Auth (for production auth)
REPL_ID=your_repl_id
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc

# Database connection details (for tools)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=compliance_db
```

### 3. Database Schema Setup

```bash
# Push schema to database
npm run db:push

# Optional: Open database studio for inspection
npm run db:studio
```

### 4. Start Development

```bash
# Start development server
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5000`
- API: `http://localhost:5000/api`

## Development Workflow

### File Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── services/           # Business logic
│   └── middleware/         # Express middleware
├── shared/                 # Shared types and schemas
└── uploads/                # File uploads (local)
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open database studio
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations

# Build
npm run build            # Build for production
npm run start            # Start production server
```

### Testing Features

1. **Document Upload**: Upload PDF, DOC, or TXT files
2. **AI Chat**: Ask questions about compliance
3. **Compliance Scoring**: View automated compliance assessments
4. **Audit Logs**: Check user activity tracking
5. **Dashboard**: Monitor system statistics

### Development Tools

#### Database Studio
```bash
npm run db:studio
```
Opens a web interface to inspect your database at `http://localhost:4983`

#### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test health check
curl http://localhost:5000/api/health

# Test document upload
curl -X POST http://localhost:5000/api/documents/upload \
  -F "files=@test-document.pdf"
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: getaddrinfo ENOTFOUND localhost
```
**Solution**: Ensure PostgreSQL is running and accessible at localhost:5432

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Stop other processes using port 5000 or change port in code

#### OpenAI API Errors
```
Error: Unauthorized
```
**Solution**: Verify your OpenAI API key is correct and has sufficient credits

#### File Upload Issues
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```
**Solution**: Ensure uploads directory exists and has proper permissions

### Environment Variables

Create a `.env` file in the root directory with:

```env
# Required
DATABASE_URL=postgresql://postgres:password@localhost:5432/compliance_db
OPENAI_API_KEY=sk-your_key_here
SESSION_SECRET=your_session_secret

# Optional (for demo mode)
NODE_ENV=development
```

### Database Reset

If you need to reset your database:

```bash
# Drop and recreate database
docker-compose down -v
docker-compose up -d postgres

# Push schema again
npm run db:push
```

## Development Tips

### Hot Reloading
The development server supports hot reloading for both frontend and backend changes.

### Database Changes
After modifying the schema in `shared/schema.ts`, run:
```bash
npm run db:push
```

### Adding New Dependencies
```bash
# Add runtime dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name
```

### Code Quality
- TypeScript strict mode is enabled
- ESLint configuration for code quality
- Prettier for code formatting

### Environment-Specific Configuration
- Development: Uses local PostgreSQL
- Production: Uses hosted PostgreSQL (Neon, Supabase, etc.)

## Next Steps

1. Set up your OpenAI API key for AI features
2. Configure your database connection
3. Test document upload functionality
4. Explore the AI chat interface
5. Review compliance scoring features
6. Check audit logging capabilities

For deployment to Vercel, see [DEPLOYMENT.md](./DEPLOYMENT.md)