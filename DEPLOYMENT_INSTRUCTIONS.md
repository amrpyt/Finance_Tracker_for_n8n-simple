# Convex Function Deployment Instructions - Story 1.4

## SSH into VPS and Restart Convex Container

```bash
ssh root@156.67.25.212
# Password: 2QEOc478Wp9eYpivhhhQ2e

# Find the Convex container
docker ps | grep convex

# Restart the Convex backend container
docker restart <convex-backend-container-name>

# Or if using docker-compose
cd /path/to/convex/docker-compose
docker-compose restart backend
```

## Alternative: Copy Files Directly to VPS

If the files aren't being picked up automatically, copy them manually:

```bash
# From your local machine
scp convex/users.js root@156.67.25.212:/path/to/convex/
scp convex/schema.js root@156.67.25.212:/path/to/convex/

# Then SSH and restart
ssh root@156.67.25.212
docker-compose restart backend
```

---

# Original Deployment Instructions

## Self-Hosted Convex Deployment

Your Convex instance is self-hosted and requires manual function deployment.

### Deployment URLs:
- **Cloud Origin:** https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com
- **Site Origin:** https://genral-data-bases-convex-bd393e-156-67-25-212.coderaai.com

### Function to Deploy: `system.ts`

**Location:** `convex/system.ts`

**Function Code:**
```typescript
import { query } from "./_generated/server";

export const getSystemStatus = query({
  args: {},
  handler: async () => {
    return {
      status: "healthy",
      timestamp: Date.now(),
      version: "1.0.0",
      message: "Convex backend is operational",
    };
  },
});
```

### Deployment Options:

#### Option 1: Web Dashboard
1. Navigate to: https://genral-data-bases-convex-bd393e-156-67-25-212.coderaai.com
2. Log in with your admin credentials
3. Go to "Functions" or "Code" section
4. Create new file: `system.ts`
5. Paste the code above
6. Click "Deploy" or "Save"

#### Option 2: Direct File Upload
If your Convex instance has a file upload interface:
1. Access the admin panel
2. Upload the file: `convex/system.ts`
3. Trigger deployment

#### Option 3: API Deployment
If you have API access, you can deploy via HTTP POST to:
```
POST https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com/api/deploy
Authorization: Bearer convex-self-hosted|01dcc2da5eac0b4327a660eee90c0436eeed476f6ca37fa443b6094b3d586f90728eba671e
```

### Verification After Deployment:

Once deployed, test the function by running:
```bash
cd bot
npm run dev
```

Then in Telegram, send `/status` to your bot: `@FinanceTracker_coderaai_bot`

Expected response:
```
🤖 System Status

Backend: ✅ Healthy
Version: 1.0.0
Latency: XX ms

Bot Uptime: X hours X minutes
Memory: XX MB / XX MB

Last Updated: 2025-10-01 18:22:00
```

### Troubleshooting:

If the function doesn't work:
1. Check function name is exactly: `system:getSystemStatus`
2. Verify the function is deployed and active
3. Check Convex logs for errors
4. Ensure the query is exported correctly

### Contact:
If you need help with deployment, contact your Convex administrator or check the self-hosted Convex documentation.
