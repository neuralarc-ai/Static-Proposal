# Vercel 405 Error - Diagnostic Steps

## Step 1: Check Vercel Functions Tab

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **Static-Proposal** (or whatever it's named)
3. Click on the **"Functions"** tab (in the top navigation)
4. Look for these routes in the list:
   - `/api/auth/authenticate`
   - `/api/auth/admin/test` (this one works)
   - `/api/auth/admin/login` (this one doesn't work)

**What to look for:**
- ✅ If you see `/api/auth/authenticate` listed → Route is deployed
- ❌ If you DON'T see it → Route isn't being deployed (this is the problem)

**Screenshot what you see** and note:
- Which routes are listed
- Which routes are missing
- Any error messages

---

## Step 2: Check Build Logs

1. In Vercel Dashboard → Your Project
2. Click on **"Deployments"** tab
3. Click on the **latest deployment** (the most recent one)
4. Click on **"Build Logs"** tab
5. Search for: `authenticate` or `admin/login`

**What to look for:**
- Look for: `ƒ /api/auth/authenticate` (should show as function route)
- Look for any errors or warnings
- Check if the route is being compiled

**Take a screenshot** of the build logs showing the route compilation.

---

## Step 3: Clear Build Cache

1. In Vercel Dashboard → Your Project
2. Click **"Settings"** (gear icon in top right)
3. Click **"General"** in left sidebar
4. Scroll down to **"Build & Development Settings"**
5. Click **"Clear Build Cache"** button
6. Click **"Save"** (if there's a save button)

**After clearing cache:**
1. Go to **"Deployments"** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT:** Uncheck **"Use existing Build Cache"** (if that option appears)
5. Click **"Redeploy"**

---

## Step 4: Check Route Deployment Status

After redeploy completes:

1. Go to **"Functions"** tab again
2. Check if `/api/auth/authenticate` now appears
3. Click on `/api/auth/authenticate` to see its details
4. Check:
   - Runtime: Should be "Node.js"
   - Memory: Should show a value
   - Region: Should show a region

---

## Step 5: Test Route Directly

After deployment, test the route directly:

**Option A: Using Browser**
1. Open browser console (F12)
2. Run this command:
```javascript
fetch('https://admin.helium.services/api/auth/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pin: '0000' })
}).then(r => r.json()).then(console.log).catch(console.error)
```

**Option B: Using Terminal**
```bash
curl -X POST https://admin.helium.services/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"pin":"0000"}'
```

**Expected Result:**
- ✅ Should return: `{"success":true,"user":{...}}`
- ❌ If 405: Route still not working
- ❌ If 404: Route not deployed
- ❌ If 500: Route deployed but has an error

---

## Step 6: Check Vercel Project Settings

1. Settings → **"General"**
2. Check:
   - **Framework Preset:** Should be "Next.js"
   - **Build Command:** Should be `npm run build`
   - **Output Directory:** Should be `.next` (or empty for auto-detect)
   - **Install Command:** Should be `npm install`

3. Settings → **"Environment Variables"**
   - Verify all variables are set correctly
   - Check that `NEXT_PUBLIC_APP_URL=https://helium.services`

---

## Step 7: Check for Rewrites/Redirects

1. Settings → **"General"**
2. Scroll to **"Rewrites"** or **"Redirects"** section
3. Check if there are any rules that might interfere with `/api/` routes
4. If there are, temporarily disable them and redeploy

---

## What to Report Back

Please provide:
1. ✅/❌ Screenshot or list of routes in Functions tab
2. ✅/❌ Screenshot of build logs showing route compilation
3. ✅/❌ Result of direct route test (curl or browser console)
4. ✅/❌ Any error messages you see

This will help identify the exact issue.

