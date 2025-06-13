# Deployment Guide

This guide covers deploying VerifydIP to various platforms and environments.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Story Protocol testnet access
- Required API keys and secrets

## Environment Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Configure the following required variables:

```env
# Database (required)
DATABASE_URL=postgresql://username:password@host:port/database

# Story Protocol (required)
VITE_STORY_PROTOCOL_RPC=https://testnet.storyrpc.io
VITE_NFT_CONTRACT_ADDRESS=your_nft_contract_address
VITE_ROYALTY_POLICY_LRP=your_royalty_policy_address

# Tomo Wallet (required)
VITE_TOMO_CLIENT_ID=your_tomo_client_id
VITE_TOMO_PROJECT_ID=your_project_id

# OpenAI (required for AI features)
OPENAI_API_KEY=your_openai_api_key

# Security (required for production)
SESSION_SECRET=generate_random_string
JWT_SECRET=generate_random_string
```

### 2. Database Setup

Create a PostgreSQL database and run migrations:

```bash
# Install Drizzle CLI globally if not already installed
npm install -g drizzle-kit

# Generate and run migrations
npm run db:generate
npm run db:migrate
```

## Deployment Options

### Option 1: Replit Deployment (Recommended for Development)

1. Configure environment variables in Replit Secrets
2. The app is automatically configured for Replit
3. Use the built-in deployment feature

### Option 2: Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Configure build settings:
```json
{
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build:client",
        "outputDirectory": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

3. Deploy:
```bash
vercel --prod
```

### Option 3: Railway Deployment

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Initialize and deploy:
```bash
railway login
railway init
railway add
railway deploy
```

### Option 4: Heroku Deployment

1. Install Heroku CLI and create app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Set environment variables:
```bash
heroku config:set VITE_TOMO_CLIENT_ID=your_client_id
heroku config:set VITE_TOMO_PROJECT_ID=your_project_id
heroku config:set OPENAI_API_KEY=your_openai_key
```

4. Deploy:
```bash
git push heroku main
```

### Option 5: AWS Deployment

#### Using AWS Amplify

1. Connect GitHub repository to AWS Amplify
2. Configure build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Using EC2

1. Launch EC2 instance with Node.js
2. Clone repository and install dependencies
3. Configure nginx as reverse proxy
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## Build Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Database
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open database studio
```

### Linting and Testing
```bash
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
npm run test         # Run tests
```

## Production Considerations

### Security
- Use HTTPS in production
- Set secure session cookies
- Configure CORS properly
- Use environment variables for secrets
- Enable rate limiting
- Regular security audits

### Performance
- Enable gzip compression
- Use CDN for static assets
- Optimize database queries
- Implement caching strategies
- Monitor application performance

### Monitoring
- Set up error tracking (Sentry)
- Monitor database performance
- Track API response times
- Set up health checks
- Configure alerts

### Scaling
- Use load balancers
- Implement database connection pooling
- Consider microservices architecture
- Use message queues for heavy operations
- Implement horizontal scaling

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database permissions
   - Ensure database is running

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

3. **Wallet Connection Issues**
   - Verify Tomo client ID and project ID
   - Check network configuration
   - Ensure proper CORS settings

4. **API Errors**
   - Check OpenAI API key validity
   - Verify Story Protocol configuration
   - Monitor API rate limits

### Logs

Check application logs:
```bash
# Development
npm run dev

# Production with PM2
pm2 logs

# Docker
docker logs container_name
```

## Rollback Strategy

1. Keep previous deployment artifacts
2. Use database migration rollbacks
3. Implement blue-green deployment
4. Monitor post-deployment metrics
5. Have emergency rollback procedures

## Support

For deployment issues:
- Check GitHub Issues
- Review documentation
- Contact development team
- Check community discussions