# Technical Assumptions - Personal Finance Tracker

**Version:** 1.0  
**Date:** 2025-09-30

---

## Repository Structure

**Monorepo**

Single repository with two main directories:
- `/convex` - Backend functions, database schema, AI integration
- `/bot` - Telegram bot server (Node.js or Python)

---

## Service Architecture

**Hybrid Architecture:**
- **Telegram Bot Server:** Lightweight Node.js/Python server handling Telegram webhook or polling
- **Convex Backend:** Serverless TypeScript functions for business logic, database operations, and AI calls
- **Communication:** Bot server calls Convex via HTTP Actions or Convex Client SDK
- **AI Integration:** Convex functions call Rork Toolkit API for natural language processing

**Rationale:** This architecture leverages Convex's strengths (real-time database, serverless scaling) while keeping bot logic separate for easier testing and potential multi-platform expansion (WhatsApp, etc.).

---

## Testing Requirements

**Unit + Integration Testing:**
- **Unit Tests:** Core business logic in Convex functions (transaction creation, balance calculation, loan tracking)
- **Integration Tests:** End-to-end flows from Telegram message → AI processing → Database update → Response
- **Manual Testing:** Natural language understanding accuracy requires human validation with diverse Arabic/English inputs
- **Test Data:** Create sample user profiles with realistic transaction patterns for regression testing

**Rationale:** AI-driven systems require both automated testing for logic and manual testing for language understanding quality.

---

## Additional Technical Assumptions and Requests

- **Language/Runtime:** TypeScript for Convex functions, Node.js (TypeScript) or Python for bot server
- **Bot Framework:** `node-telegram-bot-api` (Node.js) or `python-telegram-bot` (Python)
- **AI/LLM Provider:** Rork Toolkit API (existing config in `config.api.json`) - no OpenAI/Anthropic
- **Database:** Convex built-in database with JSON documents and relational model
- **Deployment:** Convex auto-deploys backend; bot server on free tier hosting (Railway, Render, or Fly.io)
- **Environment Variables:** Telegram Bot Token, Rork API credentials, Convex deployment URL
- **Error Handling:** Implement retry logic for AI API calls with exponential backoff
- **Logging:** Structured logging for debugging AI interpretation errors and transaction issues
- **Data Model:** Tables for `users`, `accounts`, `transactions`, `loans`, `loan_payments`
- **Rate Limiting:** Implement per-user rate limits to prevent spam (max 10 transactions/minute)
- **Localization:** Store user language preference (Arabic/English) in user profile for consistent responses
- **Currency:** Default to Egyptian Pounds (EGP) for MVP; currency symbol detection from user input

---

**Related Documents:**
- [Overview](./overview.md)
- [Requirements](./requirements.md)
- [Epic List](./epics.md)
