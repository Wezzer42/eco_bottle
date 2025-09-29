# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### ❌ React Context is unavailable in Server Components

**Error**: `Error: React Context is unavailable in Server Components`

**Cause**: Trying to use NextAuth `SessionProvider` or other client-side hooks in server components.

**Solution**:
1. ✅ Created `ClientProviders.tsx` wrapper component
2. ✅ Added `"use client"` directive to components using:
   - `useState`, `useEffect`
   - `useSession` from NextAuth
   - Framer Motion components
   - Event handlers (`onClick`, `onSubmit`)

**Files Fixed**:
- `frontend/src/components/ClientProviders.tsx` - Client wrapper
- `frontend/src/app/layout.tsx` - Uses ClientProviders instead of direct SessionProvider
- `frontend/src/components/SignupForm.tsx` - Added "use client"
- `frontend/src/components/QuickAdd.tsx` - Added "use client"

### ⚠️ NextAuth Warnings

**Warnings**:
```
[next-auth][warn][NEXTAUTH_URL] 
[next-auth][warn][NO_SECRET]
```

**Solution**:
1. ✅ Created `frontend/.env.local` with required variables:
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=super-secret-nextauth-development-key-32-chars-minimum
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

2. ✅ Added environment validation in `authOptions.ts`
3. ✅ Created `frontend/env.template` for other developers

**Files Fixed**:
- `frontend/.env.local` - Environment variables
- `frontend/env.template` - Template for developers
- `frontend/src/lib/authOptions.ts` - Added validation
- `README.md` - Updated setup instructions

### 🔧 TypeScript Errors in Framer Motion

**Error**: `Type 'string' is not assignable to type 'Easing | Easing[]'`

**Cause**: Framer Motion expects specific types for `ease` property.

**Solution**:
✅ Fixed by using proper types:
```typescript
// ❌ Before
ease: "easeOut"

// ✅ After  
ease: [0.16, 1, 0.3, 1] as const
```

**Files Fixed**:
- `frontend/src/components/Features.tsx` - Fixed ease types, added Variants import

### 🎯 ESLint Setup for Next.js

**Error**: `ESLint must be installed`

**Solution**:
✅ Installed required packages:
```bash
npm install --save-dev eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Files Added**:
- `frontend/.eslintrc.json` - ESLint configuration
- Updated `frontend/package.json` - Added lint script

## Environment Variables Reference

### Frontend (`frontend/.env.local`)
```bash
# Required for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-secret-key

# API Connection
NEXT_PUBLIC_API_BASE=http://localhost:4000

# Google OAuth (optional for basic functionality)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Backend (`backend/.env`)
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecobottle

# Cache
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-jwt-secret-key

# Server
PORT=4000
PROM_PORT=9100

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
APP_AFTER_LOGIN_URL=http://localhost:3000/profile
```

## Development Workflow

### Quick Fix Commands
```bash
# Fix TypeScript errors
npm run type-check

# Fix linting issues  
npm run lint

# Test frontend build
npm run build

# Check all at once
npm run type-check && npm run lint && npm run build
```

### Docker Issues
```bash
# Reset containers
docker-compose down && docker-compose up --build

# Clean everything
docker system prune -a

# Check container logs
docker-compose logs frontend
docker-compose logs backend
```

## CI/CD Status

| Component | Status | Notes |
|-----------|--------|-------|
| ✅ Main CI Pipeline | Working | Lint, test, build, deploy |
| ✅ TypeScript | Passing | All type errors fixed |
| ✅ ESLint | Configured | Next.js + TypeScript rules |
| ✅ NextAuth | Working | Proper env variables set |
| ✅ Docker Builds | Ready | Frontend & backend Dockerfiles |
| ✅ Environment Setup | Complete | Templates and documentation |

## Next Steps

1. Configure Google OAuth credentials for full auth functionality
2. Set up production environment variables
3. Configure deployment target (Vercel, Render, etc.)
4. Add comprehensive test suite

---

**All major issues resolved! 🎉 Project is ready for development.**
