# Vercel Deployment Setup for helium.services

## 🚀 Step-by-Step Vercel Configuration

### 1. Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `neuralarc-ai/Static-Proposal`
4. Vercel will auto-detect Next.js framework

### 2. Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=315d86e9c7e6fe88c13584f7a4ddd56d91d558708cc9f6e1277171d35ce1bd6c
JWT_EXPIRES_IN_ADMIN=24h
JWT_EXPIRES_IN_PARTNER=7d

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# App Configuration (IMPORTANT: Set this to your production domain)
NEXT_PUBLIC_APP_URL=https://helium.services
```

**Important:** Make sure `NEXT_PUBLIC_APP_URL` is set to `https://helium.services`

### 3. Configure Domain: helium.services

1. In Vercel project settings, go to **"Domains"** tab
2. Click **"Add Domain"**
3. Enter: `helium.services`
4. Vercel will show you DNS records to add

### 4. DNS Configuration

You need to add DNS records at your domain registrar (where you bought `helium.services`):

#### Option A: Using A Record (Recommended)
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
```

#### Option B: Using CNAME
```
Type: CNAME
Name: @ (or leave blank)
Value: cname.vercel-dns.com
```

**Note:** Vercel will show you the exact values after you add the domain. Use those values.

### 5. Configure Admin Subdomain: admin.helium.services

1. In Vercel project settings → **"Domains"**
2. Click **"Add Domain"** again
3. Enter: `admin.helium.services`
4. Add the DNS record shown by Vercel:

```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### 6. Build Settings

Vercel will auto-detect these, but verify:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

### 7. Deploy

1. Click **"Deploy"** button
2. Wait for build to complete
3. Your site will be live at `https://helium.services`

### 8. Verify Deployment

After deployment:
- ✅ Main site: `https://helium.services` → Partner Portal
- ✅ Admin site: `https://admin.helium.services` → Admin Portal

## 🔧 Troubleshooting

### Domain Not Working?

1. **Check DNS Propagation:**
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check if DNS has propagated
   - Can take 5 minutes to 48 hours

2. **Verify DNS Records:**
   - Make sure you added the exact records Vercel provided
   - Check for typos in domain name

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Wait a few minutes after DNS propagates

### Subdomain Not Working?

1. Make sure you added `admin.helium.services` as a separate domain in Vercel
2. Verify the CNAME record for `admin` subdomain is correct
3. Clear browser cache and try again

### Environment Variables Not Working?

1. Make sure you added them in Vercel project settings
2. Redeploy after adding new environment variables
3. Check that `NEXT_PUBLIC_APP_URL=https://helium.services` is set correctly

## 📝 Post-Deployment Checklist

- [ ] Domain `helium.services` is working
- [ ] Subdomain `admin.helium.services` is working
- [ ] SSL certificates are active (HTTPS)
- [ ] All environment variables are set
- [ ] Partner login works at `https://helium.services`
- [ ] Admin login works at `https://admin.helium.services`
- [ ] Database connection is working
- [ ] AI proposal generation is working

## 🔐 Security Notes

- Never commit `.env.local` to Git (already in `.gitignore`)
- Use different JWT secrets for different environments
- Keep your Supabase service role key secure
- Regularly rotate API keys

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure DNS records are correct

---

**Your application will be live at:**
- Partner Portal: `https://helium.services`
- Admin Portal: `https://admin.helium.services`

