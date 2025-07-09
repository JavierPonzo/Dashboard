# Deployment Guide

This guide covers deploying the Legal Compliance Automation Platform to Vercel with a PostgreSQL database.

## Prerequisites

- Vercel account
- PostgreSQL database (Neon, Supabase, or similar)
- OpenAI API key

## Step 1: Database Setup

### Option A: Neon (Recommended - Free Tier)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. It should look like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb`

### Option B: Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

## Step 2: Environment Variables

Set these in your Vercel dashboard (Project Settings → Environment Variables):

```
DATABASE_URL=postgresql://your_connection_string
OPENAI_API_KEY=sk-your_openai_key
SESSION_SECRET=your_long_random_string_here
NODE_ENV=production
```

Optional (for Replit auth):
```
REPL_ID=your_repl_id
REPLIT_DOMAINS=your-app.vercel.app
ISSUER_URL=https://replit.com/oidc
```

## Step 3: Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the configuration

### Method 2: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 4: Database Schema Setup

After deployment, initialize your database:

```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your_production_database_url"

# Push schema to production database
npm run db:push
```

## Step 5: Verify Deployment

1. Visit your deployed app URL
2. Check that all pages load correctly
3. Test document upload functionality
4. Verify AI chat is working
5. Check audit logs are being created

## Common Issues and Solutions

### Database Connection Issues

```bash
# Test database connection
psql "your_database_url"
```

If connection fails:
- Check DATABASE_URL format
- Verify database is running
- Check firewall/security settings

### Build Failures

Common causes:
- Missing environment variables
- TypeScript errors
- Missing dependencies

Check Vercel build logs for specific errors.

### File Upload Issues

- Ensure proper file permissions
- Check file size limits
- Verify upload directory exists

### AI Chat Not Working

- Verify OPENAI_API_KEY is set
- Check API key permissions
- Monitor OpenAI usage limits

## Performance Optimization

### Database
- Use connection pooling
- Add database indexes
- Optimize queries

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement caching

### API
- Add rate limiting
- Implement request caching
- Monitor response times

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics
- Monitor performance metrics
- Track user behavior

### Database Monitoring
- Monitor connection counts
- Track query performance
- Set up alerts for errors

### Application Monitoring
- Log important events
- Monitor error rates
- Track AI usage

## Security Considerations

### Environment Variables
- Never commit secrets to code
- Use Vercel's encrypted storage
- Rotate secrets regularly

### Database Security
- Use SSL connections
- Implement proper access controls
- Regular security updates

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere

## Scaling

### Database
- Use read replicas for high traffic
- Implement connection pooling
- Consider database sharding

### Application
- Use Vercel's edge functions
- Implement caching strategies
- Monitor and optimize performance

## Backup Strategy

### Database Backups
- Set up automated backups
- Test restore procedures
- Store backups securely

### File Storage
- Backup uploaded documents
- Use redundant storage
- Regular backup verification

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review database connection
3. Verify environment variables
4. Check application logs