# Deployment Guide

This guide will walk you through deploying the Sports Card Tracker web application to Netlify.

## Prerequisites

- GitHub account
- Netlify account (sign up for free at [netlify.com](https://netlify.com))
- SportsCardsPro API token (get from [sportscardspro.com](https://sportscardspro.com))

## Step 1: Fork or Clone the Repository

If you haven't already, fork or clone this repository to your GitHub account.

## Step 2: Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the `sportscardtracker` repository

## Step 3: Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

## Step 4: Set Environment Variables

Before deploying, you need to add your API token:

1. In Netlify dashboard, go to: **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Add:
   - **Key:** `SPORTSCARDSPRO_API_TOKEN`
   - **Value:** Your SportsCardsPro API token
4. Click "Save"

## Step 5: Deploy

1. Click "Deploy site"
2. Netlify will:
   - Install dependencies
   - Build the React app
   - Deploy serverless functions
   - Assign a URL (e.g., `https://your-site-name.netlify.app`)

The initial deployment takes 2-3 minutes.

## Step 6: Test Your Deployment

Once deployed, visit your site URL and test:

1. **Card Search** - Search for "michael jordan"
2. **Deal Finder** - Find deals with 25% minimum ROI
3. **Profit Calculator** - Calculate a sample profit
4. **Inventory** - Add a test card to inventory
5. **Dashboard** - Verify stats display correctly

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. SSL certificate will be automatically provisioned

## Continuous Deployment

Netlify automatically redeploys when you push to your GitHub repository:

- Push to `main` branch → Production deploy
- Pull requests → Deploy previews

## Environment Variables for Development

For local development:

1. Copy `.env.example` to `.env`
2. Add your API token:
   ```
   SPORTSCARDSPRO_API_TOKEN=your_token_here
   ```
3. Run `netlify dev` to test functions locally

## Monitoring

Monitor your site in Netlify dashboard:

- **Deploys** - View deployment history and logs
- **Functions** - Check function execution and logs
- **Analytics** - View site traffic (Netlify Pro feature)

## Troubleshooting

### Build Fails

**Error:** "Command failed with exit code 1"

**Solution:** Check build logs in Netlify dashboard. Common issues:
- Missing dependencies in `package.json`
- Syntax errors in React components
- TypeScript errors

**Fix:** Push corrections to GitHub to trigger rebuild

### API Token Error

**Error:** "SPORTSCARDSPRO_API_TOKEN environment variable not set"

**Solution:** 
1. Verify token is set in Site settings → Environment variables
2. Re-deploy site (Deploys → Trigger deploy → Deploy site)

### Functions Not Working

**Error:** "Function not found" or 404 errors

**Solution:**
1. Verify `netlify.toml` has correct functions directory
2. Check function logs in Netlify dashboard
3. Ensure functions use proper export syntax

### Blob Storage Not Persisting

**Error:** Data doesn't persist between deployments

**Solution:** 
- Netlify Blobs are region-specific
- Verify site is in supported region (Functions → Settings)
- Check blob access in function logs

### CORS Errors

**Error:** "Access-Control-Allow-Origin" errors

**Solution:**
- Functions already include CORS headers
- If using custom domain, verify DNS is correct
- Check browser console for specific error

## Performance Optimization

### Enable Branch Deploys

Create deploy previews for pull requests:
1. **Site settings** → **Build & deploy** → **Deploy contexts**
2. Enable "Deploy previews"

### Caching

Netlify automatically caches:
- Static assets (images, CSS, JS)
- Function responses (configurable)

### Split Testing (Netlify Pro)

Test different versions:
1. Deploy multiple branches
2. Use split testing to compare performance

## Security Best Practices

✅ **API Token Security**
- Never commit API token to Git
- Store in environment variables only
- Rotate tokens periodically

✅ **Input Validation**
- All functions validate inputs
- Sanitize user data before storage

✅ **HTTPS**
- Automatically enabled by Netlify
- SSL certificate auto-renewed

## Scaling

Netlify free tier includes:
- 100GB bandwidth/month
- 125,000 function invocations/month
- Unlimited sites

For higher traffic:
- Upgrade to Netlify Pro ($19/month)
- Consider caching strategies
- Optimize function execution time

## Backup and Recovery

### Data Backup

Netlify Blobs stores:
- Inventory data
- Sales records
- Price history

To backup:
1. Create export function
2. Download JSON periodically
3. Store securely

### Rollback Deployment

If a deployment breaks your site:
1. Go to **Deploys** in dashboard
2. Find last working deploy
3. Click "..." → "Publish deploy"

## Support

For issues:
- **GitHub Issues** - Report bugs or request features
- **Netlify Forums** - Deployment and hosting questions
- **Documentation** - Check README.md for usage

## Next Steps

After successful deployment:

1. ✅ Add custom domain
2. ✅ Set up branch deploys
3. ✅ Monitor function usage
4. ✅ Add test data to inventory
5. ✅ Share with team/users

---

**Congratulations!** Your Sports Card Tracker is now live! 🎉
