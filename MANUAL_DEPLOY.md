# Manual VPS Deployment Guide

## Quick Deploy Steps

### Step 1: Connect to VPS

Open **PuTTY** or **Windows Terminal** and connect:

```
Host: 156.67.25.212
Username: root
Password: 2QEOc478Wp9eYpivhhhQ2e
```

Or use command line:
```bash
ssh root@156.67.25.212
# Enter password when prompted: 2QEOc478Wp9eYpivhhhQ2e
```

---

### Step 2: Navigate to Project

```bash
cd /root/Finance_Tracker_for_n8n-simple
```

If the directory doesn't exist, find it:
```bash
find / -name "Finance_Tracker_for_n8n-simple" 2>/dev/null
```

---

### Step 3: Pull Latest Code

```bash
git pull origin master
```

Expected output:
```
Updating 1234567..9ab60e4
Fast-forward
 32 files changed, 4525 insertions(+), 11 deletions(-)
```

---

### Step 4: Install Dependencies

```bash
cd bot
npm install
```

---

### Step 5: Stop Old Bot (if running)

```bash
# Find bot process
ps aux | grep node

# Kill the process (replace PID with actual number)
kill <PID>

# Or kill all node processes
pkill -f node
```

---

### Step 6: Start Bot

```bash
# Start in background
nohup npm run dev > ../bot.log 2>&1 &

# Check if started
ps aux | grep node
```

---

### Step 7: Verify Logs

```bash
# View last 20 lines
tail -n 20 ../bot.log

# Follow logs in real-time
tail -f ../bot.log
```

Expected log output:
```
[INFO] Message handlers registered
[INFO] Telegram bot started successfully
[INFO] Bot username: @FinanceTracker_coderaai_bot
```

---

## Verification

### Test on Telegram

1. Open Telegram
2. Find: `@FinanceTracker_coderaai_bot`
3. Send: `show accounts`
4. Expected response:
   ```
   🏦 Your Accounts
   
   🏦 Visa Card (Bank): 500 EGP
   💵 فودافون كاش (Cash): 0 EGP
   💳 ء (Credit): -3 EGP
   
   💰 Total Balance: 497.00 EGP
   ```

5. Send: `عرض الحسابات`
6. Verify Arabic response

---

## Troubleshooting

### Bot Not Starting

```bash
# Check logs for errors
cat ../bot.log

# Check if port is in use
netstat -tulpn | grep 3000

# Check environment variables
cat bot/.env
```

### Git Pull Fails

```bash
# Check git status
git status

# Reset if needed
git reset --hard origin/master
git pull origin master
```

### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Useful Commands

```bash
# View bot logs
tail -f /root/Finance_Tracker_for_n8n-simple/bot.log

# Check bot process
ps aux | grep node

# Stop bot
pkill -f node

# Restart bot
cd /root/Finance_Tracker_for_n8n-simple/bot
nohup npm run dev > ../bot.log 2>&1 &

# Check git status
cd /root/Finance_Tracker_for_n8n-simple
git status
git log --oneline -5
```

---

## Success Checklist

- [ ] Connected to VPS
- [ ] Navigated to project directory
- [ ] Pulled latest code (commit: 9ab60e4)
- [ ] Installed dependencies
- [ ] Stopped old bot process
- [ ] Started new bot process
- [ ] Verified logs show no errors
- [ ] Tested "show accounts" on Telegram
- [ ] Tested "عرض الحسابات" on Telegram
- [ ] Bot responds in < 2 seconds

---

**Deployment Date:** 2025-10-02  
**Story:** 2.2 - List All Accounts with Balances  
**Commit:** 9ab60e4
