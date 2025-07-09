# Quick Start Guide

Get the Legal Compliance Platform running locally in under 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL (or Docker)
- OpenAI API Key

## 1. Setup (30 seconds)

```bash
# Clone and install
git clone <repo-url>
cd compliance-platform
npm install

# Copy environment template
cp .env.example .env
```

## 2. Configure Environment

Edit `.env` file:

```env
# Database (use one of these options)
DATABASE_URL=postgresql://postgres:password@localhost:5432/compliance_db

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=sk-your_key_here

# Session Secret (any random string)
SESSION_SECRET=your_random_secret_here_make_it_long
```

## 3. Start Database

**Option A: Docker (Recommended)**
```bash
docker-compose up -d postgres
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb compliance_db
```

## 4. Initialize Database

```bash
npm run db:push
```

## 5. Start Application

```bash
npm run dev
```

Open http://localhost:5000

## ✅ You're Ready!

- Upload documents to test AI analysis
- Try the AI chat assistant
- View compliance reports
- Check audit logs

## Common Issues

**Database Connection Error:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env

**OpenAI API Error:**
- Verify API key is correct
- Check API key has sufficient credits

**Port 5000 in Use:**
- Change port in server/index.ts
- Or stop the process using port 5000

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard:
- DATABASE_URL (use Neon or Supabase)
- OPENAI_API_KEY
- SESSION_SECRET

## Next Steps

- Read [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed setup
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for full documentation