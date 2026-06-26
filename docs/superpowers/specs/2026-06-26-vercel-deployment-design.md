# Vercel Deployment Design Specification

## Overview

Deploy the Myanmar bean trading calculator as a full-stack application on Vercel, migrating from JSON file storage to Vercel Postgres.

## Architecture

### Frontend
- **Deployment**: Vercel static site (React + Vite)
- **Build**: `client/dist/` output directory
- **API Client**: Update axios baseURL to use Vercel serverless functions

### Backend
- **Deployment**: Vercel serverless functions in `api/` directory
- **Structure**: One function per endpoint for clean separation
- **Authentication**: JWT-based with environment variables

### Database
- **Provider**: Vercel Postgres
- **Replaces**: JSON file storage (`server/data/*.json`)

## API Structure

```
api/
├── auth/
│   ├── login.js
│   └── register.js
├── beans/
│   ├── index.js          # GET /api/beans
│   └── [id].js           # GET/PUT/DELETE /api/beans/:id
├── transactions/
│   ├── index.js          # GET /api/transactions
│   └── summary.js        # GET /api/transactions/summary
└── invoice/
    ├── index.js          # GET /api/invoice
    └── calculate.js      # POST /api/invoice/calculate
```

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### beans
```sql
CREATE TABLE beans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  standard_weight DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name VARCHAR(100) NOT NULL,
  bean_type_id UUID REFERENCES beans(id),
  bags INTEGER NOT NULL,
  viss_per_bag DECIMAL(10,2) NOT NULL,
  extra_viss DECIMAL(10,2) DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  deductions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  settlement_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Key Changes

1. **Create `api/` directory** with serverless functions for each endpoint
2. **Create database migration script** to initialize Vercel Postgres tables
3. **Create shared database utility** (`api/lib/db.js`) for connection pooling
4. **Update client API calls** if needed (axios baseURL)
5. **Add `vercel.json`** configuration for routing and environment
6. **Set up environment variables**:
   - `JWT_SECRET` - for token signing
   - `POSTGRES_URL` - database connection string (auto-provided by Vercel)

## Deployment Flow

1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Configure environment variables in Vercel
4. Vercel auto-deploys on push to main branch

## Migration from Current System

### Data Migration
- Export existing data from JSON files
- Create seed script to populate Vercel Postgres
- Verify data integrity after migration

### Code Changes
- Remove Express server (`server/` directory)
- Remove Vite proxy configuration (no longer needed)
- Update client to call Vercel serverless functions directly

## Success Criteria

1. All existing functionality works on Vercel
2. Data persists across serverless function invocations
3. Authentication works with JWT
4. Invoice generation and PDF export work
5. Application is accessible via Vercel URL
