# API Reference - Rork Toolkit

## Overview
External API endpoints used in the Finance Tracker application.

## Base Configuration
- **Provider:** Rork Toolkit
- **Base URL:** `https://toolkit.rork.com`
- **Authentication:** None required (as of 2025-09-30)
- **Format:** JSON

---

## Endpoints

### 1. Text/LLM API
**Endpoint:** `POST https://toolkit.rork.com/text/llm/`

**Use Cases:**
- AI-powered financial insights
- Receipt data extraction
- Natural language queries

**Request Example:**
```javascript
const response = await fetch('https://toolkit.rork.com/text/llm/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        messages: [
            { role: "system", content: "You are a financial assistant" },
            { role: "user", content: "Analyze this receipt data" }
        ]
    })
});
```

**Performance Metrics:**
- ✅ Tested: Yes
- ⏱️ Avg Response: 2.2 seconds
- 📊 Success Rate: 100% (60/60 requests)
- 🚦 Rate Limits: None detected

---

### 2. Image Generation API
**Endpoint:** `POST https://toolkit.rork.com/images/generate/`

**Use Cases:**
- Generate financial charts/visualizations
- Create custom graphics

**Status:** ⏳ Not yet tested

---

### 3. Image Editing API
**Endpoint:** `POST https://toolkit.rork.com/images/edit/`

**Use Cases:**
- Receipt image enhancement
- OCR preprocessing

**Status:** ⏳ Not yet tested

---

### 4. Speech-to-Text API
**Endpoint:** `POST https://toolkit.rork.com/stt/transcribe/`

**Use Cases:**
- Voice expense entry
- Audio note transcription

**Supported Formats:** mp3, wav, m4a

**Status:** ⏳ Not yet tested

---

## Implementation Guidelines

### Rate Limiting Strategy
```javascript
const API_CONFIG = {
    maxConcurrentRequests: 5,
    requestsPerMinute: 60,
    retryAttempts: 3,
    backoffMs: 1000
};
```

### Error Handling
- **429 Too Many Requests:** Implement exponential backoff
- **500 Server Error:** Retry with delay
- **Timeout:** Set 5-second timeout per request

### Best Practices
1. ✅ Cache similar requests
2. ✅ Implement request queuing
3. ✅ Add loading states (2+ second response time)
4. ✅ Monitor for API changes
5. ✅ Log all API errors

---

## Testing
Test script available: `test-api-rate-limit.js`

Run tests:
```bash
node test-api-rate-limit.js
```

Last tested: 2025-09-30T14:57:06Z
