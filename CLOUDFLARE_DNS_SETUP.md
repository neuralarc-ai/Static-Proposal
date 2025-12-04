# Cloudflare DNS Configuration for Vercel

## Current Issue
Your Cloudflare DNS records are **proxied** (orange cloud), but Vercel requires **DNS-only** (gray cloud) mode.

## Step-by-Step Fix

### 1. Update the A Record for `helium.services`

**Current (Wrong):**
```
Type: A
Name: @ (or helium.services)
Content: 15.197.148.33 (or 3.33.130.190)
Proxy: Proxied (Orange Cloud) ❌
```

**Change to (Correct):**
```
Type: A
Name: @ (or helium.services)
Content: 216.198.79.1
Proxy: DNS only (Gray Cloud) ✅
```

**Steps:**
1. In Cloudflare, go to **DNS** → **Records**
2. Find the A record for `helium.services` (the one with `15.197.148.33` or `3.33.130.190`)
3. Click **Edit**
4. Change **Content** to: `216.198.79.1`
5. **Toggle OFF the orange cloud** (Proxy) - it should turn gray
6. Click **Save**

**Delete the duplicate A record** - you only need ONE A record pointing to `216.198.79.1`

### 2. Update the CNAME for `www.helium.services`

**Current (Wrong):**
```
Type: CNAME
Name: www
Content: helium.services
Proxy: Proxied (Orange Cloud) ❌
```

**Change to (Correct):**
```
Type: CNAME
Name: www
Content: 38344023f029ed94.vercel-dns-017.com.
Proxy: DNS only (Gray Cloud) ✅
```

**Steps:**
1. Find the CNAME record for `www`
2. Click **Edit**
3. Change **Content** to: `38344023f029ed94.vercel-dns-017.com.` (include the trailing dot)
4. **Toggle OFF the orange cloud** (Proxy) - it should turn gray
5. Click **Save**

### 3. Add Admin Subdomain (Optional but Recommended)

Add a new CNAME record for the admin subdomain:

```
Type: CNAME
Name: admin
Content: 38344023f029ed94.vercel-dns-017.com.
Proxy: DNS only (Gray Cloud) ✅
TTL: Auto
```

**Steps:**
1. Click **Add record**
2. Select **CNAME**
3. **Name:** `admin`
4. **Content:** `38344023f029ed94.vercel-dns-017.com.`
5. **Proxy status:** Gray cloud (DNS only)
6. Click **Save**

### 4. Remove/Keep Other Records

- **Keep:** `_domainconnect` CNAME (if needed for GoDaddy)
- **Keep:** `pay` CNAME (if you're using GoDaddy payments)
- **Remove:** Any duplicate A records for `helium.services`

## Final DNS Configuration Should Look Like:

```
Type    Name              Content                                    Proxy
A       @                216.198.79.1                               Gray (DNS only)
CNAME   www              38344023f029ed94.vercel-dns-017.com.      Gray (DNS only)
CNAME   admin            38344023f029ed94.vercel-dns-017.com.      Gray (DNS only)
CNAME   _domainconnect   _domainconnect.gd.domaincontrol.com       (can stay proxied)
CNAME   pay              paylinks.commerce.godaddy.com             (can stay proxied)
```

## Important Notes

1. **Proxy Status:** All records for Vercel (A and CNAME) must be **Gray Cloud (DNS only)**
2. **Wait Time:** DNS changes can take 5 minutes to 48 hours to propagate
3. **SSL:** Vercel will automatically provision SSL certificates once DNS is correct
4. **Verification:** After changes, wait a few minutes, then check Vercel dashboard - it should show "Valid Configuration"

## Verify DNS is Working

1. Wait 5-10 minutes after making changes
2. Check Vercel dashboard - status should change from "Invalid Configuration" to "Valid Configuration"
3. Test the domain: `https://helium.services` should load your site
4. Test admin subdomain: `https://admin.helium.services` should load admin portal

## Troubleshooting

### Still showing "Invalid Configuration"?
- Wait longer (up to 48 hours for full propagation)
- Check that proxy is OFF (gray cloud) on all Vercel-related records
- Verify the IP address matches exactly: `216.198.79.1`
- Verify the CNAME matches exactly: `38344023f029ed94.vercel-dns-017.com.`

### Site not loading?
- Check Vercel deployment logs
- Verify environment variables are set
- Check that build completed successfully

### SSL Certificate issues?
- Vercel automatically provisions SSL - wait 5-10 minutes after DNS is correct
- Make sure DNS records are correct and not proxied

