# Vercel 405 Error Troubleshooting Guide

## Issue: 405 Method Not Allowed on `/api/auth/admin/login`

### Current Status
- ✅ Route works perfectly on localhost
- ✅ Route structure matches working partner route
- ✅ Environment variables are correct
- ❌ Route returns 405 on Vercel production

### Diagnostic Steps

#### 1. Test the Test Route First
Visit: `https://admin.helium.services/api/auth/admin/test`

**Expected:** Should return JSON with success message
**If 405:** The entire `/api/auth/admin/` directory has issues
**If 200:** Only the login route has issues

#### 2. Check Vercel Functions Tab
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. Look for `/api/auth/admin/login`

**If missing:** Route isn't being deployed
**If present:** Route is deployed but not working

#### 3. Check Build Logs
1. Go to latest deployment
2. Click "Build Logs"
3. Search for "admin/login"

**Look for:**
- `ƒ /api/auth/admin/login` (function route)
- Any errors or warnings
- Route compilation messages

#### 4. Verify Route File Structure
The route file MUST be at:
```
app/api/auth/admin/login/route.ts
```

And MUST export:
```typescript
export async function POST(request: NextRequest) { ... }
```

### Solutions to Try

#### Solution 1: Force Fresh Deployment
1. Clear Build Cache (Settings → General → Clear Build Cache)
2. Delete the route file temporarily
3. Commit and push
4. Wait for deployment
5. Restore the route file
6. Commit and push again
7. This forces Vercel to rebuild the route

#### Solution 2: Rename the Route
Try renaming the route to force Vercel to recognize it:
- Change from `/api/auth/admin/login` to `/api/auth/admin/auth-login`
- Update frontend to use new endpoint
- Test if new route works
- If it works, rename back

#### Solution 3: Check Next.js Version
Current: Next.js 14.2.0
- Try upgrading to latest 14.x
- Or check if there are known issues with 14.2.0

#### Solution 4: Verify Middleware Exclusion
The middleware matcher should exclude `/api/`:
```typescript
'/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
```

#### Solution 5: Check Vercel Project Settings
1. Framework Preset: Next.js
2. Build Command: `npm run build`
3. Output Directory: `.next` (default)
4. Install Command: `npm install`

### Alternative: Use Partner Route as Proxy
If nothing works, temporarily route admin login through partner endpoint:
1. Create `/api/auth/login` that handles both roles
2. Or use `/api/auth/partner/login` for both (not ideal)

### Next Steps
1. Test `/api/auth/admin/test` endpoint first
2. Check Vercel Functions tab
3. Review build logs
4. Try Solution 1 (force fresh deployment)

