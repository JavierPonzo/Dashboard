# Legal Compliance Automation Platform

A comprehensive SaaS platform for legal compliance and automation, featuring AI-powered document analysis, compliance monitoring, and audit logging.

## Features

- 🤖 AI-powered document analysis using OpenAI GPT-4o
- 📊 Real-time compliance monitoring (GDPR, ISO 27001)
- 📝 Document management and processing
- 🔒 Comprehensive audit logging
- 🌐 Multi-language support (English, German)
- 💬 Interactive AI chat assistant
- 🔐 Secure authentication and authorization

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o
- **Build**: Vite, esbuild
- **Deployment**: Vercel-ready

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd compliance-platform
npm install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL

Install PostgreSQL locally and create a database:

```bash
createdb compliance_db
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
```

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/compliance_db

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Session
SESSION_SECRET=your_random_session_secret_here

# Auth (optional for demo mode)
REPL_ID=your_repl_id
REPLIT_DOMAINS=localhost:5000
```

### 4. Database Schema

```bash
# Push schema to database
npm run db:push

# Optional: Open database studio
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment to Vercel

### 1. Prepare for Deployment

The project includes `vercel.json` configuration for seamless deployment.

### 2. Database Setup

Set up a PostgreSQL database (recommended providers):
- **Neon** (free tier available)
- **Supabase** (free tier available)
- **PlanetScale** (MySQL alternative)

### 3. Environment Variables

In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=your_production_database_url
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_production_session_secret
REPL_ID=your_repl_id (if using Replit auth)
REPLIT_DOMAINS=your-app.vercel.app
```

### 4. Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 5. Post-Deployment

After deployment, run database migrations:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your_production_database_url"

# Push schema to production database
npm run db:push
```

## Features Overview

### Document Management
- Multi-file upload with drag & drop
- AI-powered analysis and compliance scoring
- Document version control and history
- Secure file storage and access control

### Compliance Monitoring
- GDPR compliance scoring
- ISO 27001 assessments
- Data retention policy tracking
- Automated compliance reports

### AI Assistant
- Interactive chat interface
- Document-specific queries
- Compliance guidance
- Contract generation assistance

### Audit System
- Comprehensive activity logging
- User action tracking
- Compliance audit trails
- Detailed reporting

## API Documentation

### Authentication
- Demo mode: No authentication required
- Production: Replit OIDC integration

### Key Endpoints
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents` - List user documents
- `POST /api/chat` - AI chat interaction
- `GET /api/compliance/score` - Get compliance scores
- `GET /api/audit-logs` - View audit logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details