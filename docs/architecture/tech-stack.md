# Technology Stack Reference

**Version:** 1.0  
**Last Updated:** 2025-09-30

This document provides the definitive technology selections for the Personal Finance Tracker Telegram Bot. All development must use these exact versions and tools.

---

## Core Technologies

### Bot Server Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18.x LTS | Runtime environment |
| **TypeScript** | 5.3+ | Type-safe development |
| **node-telegram-bot-api** | 0.64+ | Telegram Bot API integration |
| **Express** | 4.18+ | Webhook server |
| **dotenv** | 16+ | Environment configuration |

### Backend Stack (Convex)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Convex** | Latest | Serverless backend platform |
| **TypeScript** | 5.3+ | Convex function development |
| **Convex DB** | Built-in | Real-time database |

### AI/LLM Integration

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Rork Toolkit API** | Latest | Natural language understanding |
| **Function Calling** | N/A | Structured AI responses |

---

## Development Tools

### Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | 29+ | Bot server unit tests |
| **Vitest** | 1.0+ | Convex function tests |
| **Convex Test** | Built-in | Convex integration tests |

### Build & Deployment

| Tool | Version | Purpose |
|------|---------|---------|
| **npm** | 9+ | Package management |
| **esbuild** | Built-in | Convex bundling |
| **GitHub Actions** | N/A | CI/CD pipeline |

### Code Quality

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 8+ | Linting |
| **Prettier** | 3+ | Code formatting |
| **TypeScript** | 5.3+ | Type checking |

---

## Infrastructure & Hosting

### Deployment Platforms

| Platform | Purpose | Tier |
|----------|---------|------|
| **Convex Cloud** | Backend hosting | Free tier (1M calls/month) |
| **Railway** | Bot server hosting | Free tier |
| **GitHub** | Source control & CI/CD | Free |

### Monitoring & Logging

| Tool | Purpose |
|------|---------|
| **Convex Dashboard** | Function logs & metrics |
| **Railway Logs** | Bot server logs |
| **Console Logging** | Development debugging |

---

## Package Dependencies

### Bot Server (`bot/package.json`)

```json
{
  "dependencies": {
    "node-telegram-bot-api": "^0.64.0",
    "express": "^4.18.2",
    "convex": "^1.0.0",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/node-telegram-bot-api": "^0.64.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### Convex (`convex/package.json`)

```json
{
  "dependencies": {
    "convex": "^1.0.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "convex-test": "^0.0.1"
  }
}
```

### Shared Types (`shared/package.json`)

```json
{
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

---

## Version Constraints

### Critical Version Requirements

- **Node.js:** Must be 18.x or higher (for native fetch support)
- **TypeScript:** Must be 5.3+ (for Convex compatibility)
- **Convex:** Always use latest version (auto-updated by CLI)

### Upgrade Policy

- **Patch versions:** Auto-update allowed (e.g., 5.3.2 → 5.3.3)
- **Minor versions:** Review and test before upgrading (e.g., 5.3 → 5.4)
- **Major versions:** Requires architecture review (e.g., 5.x → 6.x)

---

## Environment Requirements

### Development Environment

```bash
Node.js: 18.x LTS
npm: 9.x
OS: Windows, macOS, or Linux
RAM: 4GB minimum
```

### Production Environment

```bash
Node.js: 18.x LTS (Railway managed)
Convex: Managed runtime
Regions: US-East-1 (Railway), Global (Convex)
```

---

## External Service Requirements

### Required API Keys

1. **Telegram Bot Token** (from @BotFather)
2. **Rork Toolkit API Key** (from Rork dashboard)
3. **Convex Deployment URL** (from Convex dashboard)

### Optional Services (Post-MVP)

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Advanced monitoring

---

## Technology Selection Rationale

### Why Convex?

- **Zero database management:** No SQL, migrations, or scaling concerns
- **Real-time capabilities:** Built-in reactivity for future features
- **TypeScript-first:** Type safety across frontend and backend
- **Generous free tier:** 1M function calls/month sufficient for 100-1000 users
- **Automatic scaling:** Handles traffic spikes without configuration

### Why Telegram Bot API?

- **No frontend development:** Users already have Telegram installed
- **Rich messaging features:** Markdown, buttons, inline keyboards
- **Global reach:** 700M+ active users worldwide
- **Free infrastructure:** No hosting costs for messaging
- **Arabic support:** Native RTL text rendering

### Why Rork Toolkit?

- **Specified in PRD:** Client requirement
- **Function calling support:** Structured AI responses
- **Competitive pricing:** Cost-effective for MVP
- **Arabic language support:** Critical for target market

### Why Node.js + TypeScript?

- **Convex requirement:** Convex functions must be TypeScript
- **Type safety:** Shared types between bot and backend
- **Ecosystem:** Rich npm ecosystem for Telegram bots
- **Performance:** Sufficient for I/O-bound workload

---

## Deprecated/Avoided Technologies

### Not Using

- ❌ **OpenAI/Anthropic APIs:** Rork Toolkit specified in PRD
- ❌ **Traditional databases (PostgreSQL, MongoDB):** Convex DB provides all needed features
- ❌ **Docker/Kubernetes:** Serverless deployment eliminates need
- ❌ **Redis:** Convex provides built-in caching
- ❌ **GraphQL:** Simple Convex functions sufficient for MVP

---

## Future Technology Considerations

### Post-MVP Additions

- **Sentry:** Error tracking and monitoring
- **Playwright:** E2E testing automation
- **Turborepo:** If monorepo grows beyond 3 packages
- **Redis:** If caching needs exceed Convex capabilities
- **WhatsApp Business API:** Multi-platform expansion

---

**Document Owner:** Architect  
**Review Frequency:** Quarterly or when major dependencies change
