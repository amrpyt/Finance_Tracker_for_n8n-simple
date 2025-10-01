# Deploy Story 1.4 to Self-Hosted Convex

## Issue
The Convex CLI (v1.27.3) doesn't properly read `.env.local` for self-hosted deployments.

## Solution: Direct Deployment to VPS

### Step 1: SSH into your VPS
```bash
ssh root@156.67.25.212
# Password: 2QEOc478Wp9eYpivhhhQ2e
```

### Step 2: Find your Convex deployment directory
```bash
# Find where Dokploy deployed your Convex files
cd /path/to/your/convex/deployment
# OR
docker ps
docker exec -it <convex-container-id> ls /app
```

### Step 3: Copy the new files
From your local machine:
```powershell
# Copy users.js
scp convex/users.js root@156.67.25.212:/path/to/convex/

# Copy schema.js  
scp convex/schema.js root@156.67.25.212:/path/to/convex/
```

### Step 4: Restart Convex container
```bash
# SSH into VPS
ssh root@156.67.25.212

# Find Convex container
docker ps | grep convex

# Restart it
docker restart <convex-container-id>

# OR if using docker-compose
cd /path/to/docker-compose
docker-compose restart backend
```

### Step 5: Verify deployment
Run the test script:
```bash
node test-user-registration.js
```

Or test with Telegram bot:
```bash
cd bot
npm run dev
# Then send /start to your bot
```

## Alternative: Use Dokploy UI

If you're using Dokploy:
1. Go to Dokploy dashboard
2. Find your Convex service
3. Trigger a redeploy
4. The new files will be picked up automatically

## Files Modified
- `convex/schema.js` - Added users table
- `convex/users.js` - Added createOrGetUser mutation
- `bot/src/handlers/commands.ts` - Updated /start handler
