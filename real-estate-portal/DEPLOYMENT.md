# Deployment Guide - Real Estate Portal

This guide will walk you through deploying your real estate portal to Render.com.

## Prerequisites

Before deploying, ensure you have:
- A GitHub/GitLab/Bitbucket account
- Your code pushed to a Git repository
- A Render.com account (free tier available)
- Your Supabase credentials ready

## Step 1: Push Code to Git Repository

If you haven't already, initialize a git repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

**IMPORTANT**: Make sure your `.env` file is NOT committed (it should be in .gitignore already).

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up for a free account (you can use GitHub/GitLab to sign in)
3. Verify your email address

## Step 3: Deploy Your Application

### Option A: Using render.yaml (Recommended - Infrastructure as Code)

1. In Render Dashboard, click "New +"
2. Select "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to create the service

### Option B: Manual Setup

1. In Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your Git repository
4. Configure the following:
   - **Name**: `real-estate-portal` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free" tier

## Step 4: Configure Environment Variables

After creating the service, go to the "Environment" tab and add these variables:

| Variable Name | Value | Where to Find |
|--------------|-------|---------------|
| `NODE_ENV` | `production` | Static value |
| `PORT` | `10000` | Static value (Render default) |
| `SUPABASE_URL` | Your Supabase URL | From your Supabase project settings |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | From your Supabase project API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | From your Supabase project API settings |
| `DATABASE_TABLE` | `property_inquiries` | Your database table name |
| `FRONTEND_URL` | Your Render URL | Will be like `https://real-estate-portal.onrender.com` |
| `API_BASE_URL` | Your Render URL + /api | Will be like `https://real-estate-portal.onrender.com/api` |

### How to Find Your Supabase Credentials:

1. Go to https://supabase.com
2. Open your project
3. Click on "Settings" (gear icon) in the sidebar
4. Go to "API" section
5. Copy the following:
   - **Project URL** → Use for `SUPABASE_URL`
   - **anon/public key** → Use for `SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 5: Update Frontend URLs

After deployment, you need to update the hardcoded URLs in your frontend:

1. Go to your Render dashboard
2. Copy your service URL (e.g., `https://real-estate-portal.onrender.com`)
3. Update these environment variables:
   - `FRONTEND_URL`: `https://your-app-name.onrender.com`
   - `API_BASE_URL`: `https://your-app-name.onrender.com/api`
4. Render will automatically redeploy with the new values

## Step 6: Verify Deployment

1. Once deployment completes (usually 2-5 minutes), click on your service URL
2. You should see your real estate portal homepage
3. Test the form submission to ensure it connects to Supabase
4. Check the API at: `https://your-app-name.onrender.com/api`

## Step 7: Configure Supabase CORS (If Needed)

If you encounter CORS errors:

1. Go to your Supabase project
2. Navigate to "Authentication" → "URL Configuration"
3. Add your Render URL to "Site URL" and "Redirect URLs"

## Important Notes

### Free Tier Limitations:
- **Cold starts**: Free tier services spin down after 15 minutes of inactivity
- **First request takes 30-60 seconds** to wake up the service
- **750 hours/month** of usage (enough for one always-on service)

### Monitoring Your App:
- View logs in the Render dashboard under "Logs" tab
- Set up email alerts for deployment failures
- Monitor your Supabase usage in the Supabase dashboard

### Automatic Deployments:
- Render automatically redeploys when you push to your main branch
- You can disable auto-deploy in Settings if needed
- Manual deploys are also available

## Troubleshooting

### Issue: "Application failed to respond"
- Check your logs in Render dashboard
- Ensure all environment variables are set correctly
- Verify `PORT` is set to `10000`

### Issue: "Cannot connect to Supabase"
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase dashboard for any service issues
- Ensure your database table exists and RLS policies are configured

### Issue: "CORS errors"
- Update CORS configuration in `server.js` if needed
- Add your Render URL to Supabase allowed origins

### Issue: "Service keeps crashing"
- Check the logs for specific error messages
- Ensure all dependencies are in `package.json`
- Verify your database schema is set up correctly

## Updating Your App

To update your deployed application:

1. Make changes to your code locally
2. Commit and push to your Git repository:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Render will automatically detect the changes and redeploy

## Next Steps

After successful deployment:

1. Set up a custom domain (optional, available in Render dashboard)
2. Enable HTTPS (automatically provided by Render)
3. Set up monitoring and alerts
4. Consider upgrading to a paid plan for:
   - No cold starts
   - More compute resources
   - Better performance

## Support

- **Render Documentation**: https://render.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Render Community**: https://community.render.com

## Security Checklist

- [ ] `.env` file is in `.gitignore` and not committed
- [ ] Environment variables are configured in Render (not hardcoded)
- [ ] Supabase service role key is kept secret
- [ ] Database RLS policies are properly configured
- [ ] CORS is configured to allow only your domain
- [ ] HTTPS is enabled (automatic on Render)

---

**Your app URL will be**: `https://real-estate-portal.onrender.com` (or your chosen name)

Good luck with your deployment!
