# API Endpoints Configuration

## Rork Toolkit API

Base URL: `https://toolkit.rork.com`

### Text/LLM Endpoints

#### POST /text/llm/
**Purpose:** AI text generation and chat completion

**Request Format:**
```json
{
    "messages": [
        {
            "role": "system",
            "content": "You are an assistant"
        },
        {
            "role": "user",
            "content": "Your message here"
        }
    ]
}
```

**Response:** 200 OK with generated text

**Performance:**
- Average Response Time: ~2.2 seconds
- Tested Rate: 60+ requests without throttling
- No rate limit headers detected

**Status:** ✅ Tested & Working (2025-09-30)

---

### Image Endpoints (To Be Tested)

#### POST /images/generate/
**Purpose:** DALL-E 3 image generation
**Status:** ⏳ Not yet tested

#### POST /images/edit/
**Purpose:** AI-powered image modifications
**Status:** ⏳ Not yet tested

---

### Speech-to-Text Endpoints (To Be Tested)

#### POST /stt/transcribe/
**Purpose:** Audio transcription (mp3, wav, m4a)
**Status:** ⏳ Not yet tested

---

## Usage Notes

### Rate Limiting Strategy
- **Recommended:** Max 5-10 concurrent requests
- **Implement:** Exponential backoff retry logic
- **Monitor:** Watch for 429 (Too Many Requests) responses

### Error Handling
```javascript
const retryConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    timeoutMs: 5000
};
```

### Security
- No API key required (as of testing date)
- May indicate beta/testing phase
- Monitor for authentication requirements

---

## Test Results

Last tested: 2025-09-30T14:57:06Z
Test script: `test-api-rate-limit.js`
Results: 60/60 successful requests (100% success rate)
