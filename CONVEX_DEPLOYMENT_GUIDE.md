# Convex Deployment Guide

## ✅ Current Deployment Status

**Deployment URL:** https://ceaseless-cardinal-528.convex.cloud  
**HTTP Actions URL:** https://ceaseless-cardinal-528.convex.site  
**Status:** ✅ Deployed and Operational

---

## 📋 Deployed Functions

| Function | Type | Status |
|----------|------|--------|
| `users:createOrGetUser` | Mutation | ✅ Active |
| `users:getUserByTelegramId` | Query | ✅ Active |

**Tables:**
- ✅ `users` table with `by_telegram_id` index

---

## 🚀 How to Deploy Updates

### Prerequisites
- Deploy key in `.env.local`
- Convex installed in project root (NOT in convex/ directory)

### Deployment Command
```bash
# From project root
npx convex deploy --yes
```

### Environment Variables
```bash
# .env.local (project root)
CONVEX_DEPLOY_KEY=prod:ceaseless-cardinal-528|eyJ2MiI6ImQwOGNjZDM0ODYzOTRiOGE4MzFhNmIxMjFlNzUwYmJkIn0=
CONVEX_URL=https://ceaseless-cardinal-528.convex.cloud
```

---

## ⚠️ Critical: Correct Project Structure

**✅ CORRECT Structure:**
```
Finance_Tracker_for_n8n-simple/
├── node_modules/              ← Convex installed HERE
│   └── convex/
├── convex/                    ← Functions ONLY
│   ├── schema.ts
│   ├── users.ts
│   └── _generated/
├── package.json               ← Root package.json
└── .env.local
```

**❌ WRONG Structure (Will Fail):**
```
Finance_Tracker_for_n8n-simple/
├── convex/
│   ├── node_modules/          ← NEVER put node_modules here!
│   ├── package.json           ← NEVER create package.json here!
│   ├── schema.ts
│   └── users.ts
```

---

## 🐛 Common Issues & Solutions

### Issue: "Could not resolve fs/crypto/zlib"
**Cause:** `node_modules` exists inside `convex/` directory  
**Solution:**
```bash
rm -rf convex/node_modules convex/package.json
npm install convex@latest  # In project root
```

### Issue: "Could not find public function"
**Cause:** Functions not deployed  
**Solution:**
```bash
npx convex deploy --yes
```

### Issue: CLI tries to bundle test files
**Cause:** Test files in convex/ directory  
**Solution:** Move tests to separate directory or use `.gitignore`

---

## 🧪 Testing Deployment

### Run Integration Tests
```bash
node test-user-registration.js
```

### Expected Output
```
Test 1: Creating new user... ✅
Test 2: Getting existing user... ✅
Test 3: Querying user by Telegram ID... ✅
Test 4: Testing language preference... ✅
Test 5: Testing English language preference... ✅

🎉 All tests passed!
```

### Manual Testing
```bash
# Start bot
cd bot
npm run dev

# In Telegram, send:
/start
```

---

## 📊 Monitoring

**Convex Dashboard:** https://dashboard.convex.dev/d/ceaseless-cardinal-528

**What to monitor:**
- Function execution logs
- Table data (users table)
- Performance metrics
- Error rates

---

## 🔑 Key Lessons

1. **Never install dependencies inside your functions directory**
   - Keep `node_modules` in project root
   - Convex CLI scans functions directory and will try to bundle everything

2. **Use TypeScript for Convex Cloud**
   - `.ts` files for schema and functions
   - JavaScript (`.js`) was only needed for self-hosted Docker Convex

3. **Test before deploying**
   - Run unit tests: `npm test`
   - Run integration tests after deployment

4. **Keep functions directory clean**
   - Only `.ts` function files
   - No test files, no configs, no node_modules

---

**Last Updated:** 2025-10-01  
**Deployment Status:** ✅ Production Ready
