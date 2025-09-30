# Project Brief: Personal Finance Tracker (Telegram Bot)

**Version:** 1.0  
**Date:** 2025-09-30  
**Status:** Draft

---

## Executive Summary

A personal finance management system delivered entirely through Telegram, enabling users to track expenses, income, bank accounts, and loans through natural language conversations with an AI agent. The system uses Convex as a reactive backend with TypeScript, providing real-time data synchronization and a fully conversational interface that eliminates the need for traditional forms or complex UIs. Users can manage their complete financial picture by simply chatting with the bot in Arabic or English.

**Target Market:** Arabic-speaking individuals seeking simple, accessible personal finance tracking without installing dedicated apps.

**Key Value Proposition:** Zero-friction financial tracking through a familiar chat interface, powered by AI that understands context and automatically categorizes transactions.

---

## Problem Statement

### Current State & Pain Points

**The Problem:**
- Traditional finance apps require installation, account creation, and learning new interfaces
- Most finance trackers have complex UIs that create friction for daily logging
- Arabic speakers lack quality personal finance tools in their native language
- Manual categorization of expenses is tedious and often skipped
- Tracking loans to friends/family is informal and easily forgotten
- People want financial awareness but don't want to spend time on data entry

### Impact

- **Lost Money:** Uncollected loans and forgotten expenses lead to financial leakage
- **Poor Financial Decisions:** Without clear visibility, users overspend and miss savings opportunities
- **Time Waste:** Manual entry in traditional apps takes 5-10 minutes daily
- **Low Adoption:** 70% of people who download finance apps stop using them within a month

### Why Existing Solutions Fall Short

- **Mobile Apps:** Require installation, updates, and dedicated screen time
- **Spreadsheets:** Manual, error-prone, no intelligence
- **Banking Apps:** Only show transactions, don't help with cash or loans
- **Existing Bots:** Limited functionality, no AI understanding, English-only

### Urgency

With rising cost of living and economic uncertainty, personal financial awareness is critical. People need tools that fit into their existing habits (messaging) rather than requiring new behaviors.

---

## Proposed Solution

### Core Concept

A Telegram bot that acts as a personal financial assistant, allowing users to:
- Log expenses and income through natural conversation
- Track multiple bank accounts and cash
- Monitor loans given to others
- Get instant financial insights and balance updates
- Receive spending analysis and recommendations

### Key Differentiators

1. **Zero Installation:** Works in Telegram, which users already have
2. **AI-Powered Understanding:** Natural language processing via Rork Toolkit API understands context without rigid commands
3. **Arabic-First:** Native Arabic support with cultural context
4. **Conversational UX:** No forms, buttons, or complex navigation
5. **Real-time Sync:** Powered by Convex for instant updates across devices
6. **Loan Tracking:** Unique focus on peer-to-peer lending tracking

### Why This Will Succeed

- **Habit Integration:** Meets users where they already are (Telegram)
- **Minimal Friction:** Logging an expense takes 5 seconds via chat
- **Smart Automation:** AI categorizes and extracts transaction details automatically
- **Cultural Fit:** Designed for Arabic-speaking users' financial habits
- **Modern Stack:** Convex + TypeScript ensures reliability and scalability

### High-Level Vision

A financial companion that lives in your pocket, understands your spending patterns, proactively suggests budgets, and helps you achieve financial goals through simple conversations.

---

## Target Users

### Primary User Segment: Young Arabic Professionals

**Demographics:**
- Age: 22-40 years old
- Location: Middle East, North Africa
- Income: Middle class, salaried employees or freelancers
- Tech Savvy: Active Telegram users, comfortable with messaging apps

**Current Behaviors:**
- Use Telegram daily for personal and work communication
- Track finances informally (mental notes, occasional spreadsheets)
- Frequently lend money to friends/family
- Mix cash and digital payments
- Want to save but lack clear visibility into spending

**Specific Needs:**
- Quick expense logging without context switching
- Arabic language support
- Loan tracking to remember who owes them money
- Simple balance overview across accounts
- Privacy (data not shared with employers or banks)

**Goals:**
- Build emergency savings
- Reduce unnecessary spending
- Track and collect outstanding loans
- Understand monthly spending patterns
- Make informed financial decisions

### Secondary User Segment: Small Business Owners

**Demographics:**
- Age: 25-50 years old
- Business: Freelancers, small shop owners, service providers
- Location: Arabic-speaking regions

**Specific Needs:**
- Separate personal and business expenses
- Track customer payments and debts
- Simple bookkeeping without accounting software
- Cash flow visibility

---

## Goals & Success Metrics

### Business Objectives

- **User Acquisition:** 1,000 active users within 3 months of launch
- **Engagement:** 60% of users log at least one transaction per week
- **Retention:** 40% of users still active after 30 days
- **Growth:** 20% month-over-month user growth through organic sharing

### User Success Metrics

- **Time to First Transaction:** < 2 minutes from bot start
- **Daily Active Users (DAU):** 30% of total user base
- **Transactions per User:** Average 15+ transactions logged per month
- **Feature Adoption:** 50% of users track at least one loan

### Key Performance Indicators (KPIs)

- **Response Time:** AI agent responds within 2 seconds
- **Accuracy:** 85%+ correct transaction categorization by AI
- **Uptime:** 99.5% system availability
- **User Satisfaction:** 4.5+ star rating (via in-bot feedback)
- **Viral Coefficient:** 0.3+ (users invite others)

---

## MVP Scope

### Core Features (Must Have)

- **User Onboarding:** Simple /start command with welcome message and quick tutorial
- **Expense Tracking:** Log expenses via natural language (e.g., "دفعت 50 جنيه على القهوة")
- **Income Tracking:** Log income sources (e.g., "استلمت راتب 5000")
- **Account Management:** Create and manage multiple accounts (bank, cash, credit card)
- **Balance Overview:** Instant balance check via command or question
- **Loan Management:** Track money lent to others with borrower name, amount, and status
- **Loan Payments:** Record partial payments on loans
- **Transaction History:** View recent transactions
- **AI Agent:** Rork Toolkit API integration for natural language understanding
- **Function Calling:** AI automatically calls appropriate functions based on context
- **Arabic Support:** Full Arabic language interface and understanding
- **Data Privacy:** User data isolated and secure in Convex

### Out of Scope for MVP

- Receipt scanning/OCR
- Budget creation and alerts
- Recurring transaction automation
- Multi-currency support
- Export to Excel/PDF
- Spending analytics and charts
- Bill reminders
- Investment tracking
- Shared accounts/family features
- Web dashboard
- Mobile app (only Telegram)

### MVP Success Criteria

**The MVP is successful if:**
1. Users can log 10+ transactions in their first week without confusion
2. AI correctly interprets 80%+ of natural language inputs
3. Users report the bot is "easier than other finance apps" they've tried
4. At least 30% of users track a loan within first month
5. Zero critical bugs or data loss incidents

---

## Post-MVP Vision

### Phase 2 Features

- **Smart Budgets:** AI suggests budgets based on spending patterns
- **Spending Insights:** Weekly/monthly reports with trends and recommendations
- **Categories:** Custom expense categories
- **Recurring Transactions:** Auto-log salary, rent, subscriptions
- **Reminders:** Notify about upcoming bills or overdue loans
- **Receipt Storage:** Upload and attach receipt images to transactions
- **Multi-Currency:** Support for multiple currencies with auto-conversion

### Long-term Vision (1-2 Years)

- **Financial Goals:** Set and track savings goals with progress visualization
- **Investment Tracking:** Monitor stocks, crypto, and other investments
- **Bill Splitting:** Track shared expenses with roommates/friends
- **Family Accounts:** Shared household finance management
- **Merchant Recognition:** Auto-categorize based on merchant patterns
- **Voice Input:** Log transactions via voice messages
- **Predictive Insights:** "You're spending more than usual on dining this month"
- **Integration:** Connect to bank APIs for automatic transaction import

### Expansion Opportunities

- **B2B Version:** Small business accounting via Telegram
- **WhatsApp Bot:** Expand to WhatsApp for broader reach
- **Financial Coaching:** AI-powered personalized financial advice
- **Community Features:** Anonymous spending comparisons with similar users
- **Marketplace:** Recommend financial products (savings accounts, credit cards)

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Telegram (iOS, Android, Web, Desktop)
- **Browser/OS Support:** Any device that runs Telegram
- **Performance Requirements:** 
  - Message response time < 2 seconds
  - Support 1000+ concurrent users
  - Handle 10,000+ transactions per user without slowdown

### Technology Preferences

- **Frontend:** Telegram Bot API (no custom frontend needed)
- **Backend:** Convex (TypeScript functions, reactive database, real-time sync)
- **Database:** Convex built-in database (JSON documents with relational model)
- **AI/LLM:** Rork Toolkit API (existing config in `config.api.json`)
- **Bot Framework:** Node.js with `node-telegram-bot-api` or Python with `python-telegram-bot`
- **Language:** TypeScript for Convex functions, Node.js/Python for bot server

### Architecture Considerations

- **Repository Structure:** Monorepo with `/convex` (backend) and `/bot` (Telegram server)
- **Service Architecture:** 
  - Telegram Bot → Convex HTTP Actions (webhook)
  - OR Telegram Bot (Node.js) → Convex Client SDK
  - Convex Functions → Rork Toolkit API for AI
- **Integration Requirements:**
  - Telegram Bot API for messaging
  - Rork Toolkit API for LLM (`https://toolkit.rork.com/text/llm/`)
  - Convex for database and functions
- **Security/Compliance:**
  - User data encrypted at rest (Convex default)
  - No PII shared with third parties
  - Telegram user ID as primary identifier
  - Rate limiting on AI API calls to prevent abuse

### Data Model

**Core Tables:**
- `users` - Telegram user profiles
- `accounts` - Bank accounts, cash, credit cards
- `transactions` - All income/expense records
- `loans` - Money lent to others
- `loan_payments` - Payment history for loans
- `categories` - Expense/income categories (future)

---

## Constraints & Assumptions

### Constraints

- **Budget:** $0-50/month (free tiers: Convex free tier, Telegram Bot API free)
- **Timeline:** MVP in 2-3 weeks (solo developer, part-time)
- **Resources:** Single developer, no design team
- **Technical:** 
  - Must use Rork Toolkit API (no OpenAI/Anthropic)
  - Must work within Convex free tier initially (1M function calls/month)
  - Telegram rate limits (30 messages/second per bot)

### Key Assumptions

- Users have Telegram installed and use it regularly
- Users are comfortable typing in Arabic or English
- Internet connectivity is available when logging transactions
- Users trust storing financial data in a bot (privacy concerns addressed)
- Rork Toolkit API has sufficient rate limits for expected usage
- Convex free tier is adequate for initial user base (<100 users)
- Users prefer simplicity over advanced features in MVP

---

## Risks & Open Questions

### Key Risks

- **AI Accuracy:** Rork Toolkit API may misinterpret natural language inputs, leading to incorrect transactions
  - *Mitigation:* Implement confirmation messages before saving transactions, allow easy editing/deletion
  
- **User Adoption:** Users may not trust a bot with financial data
  - *Mitigation:* Clear privacy policy, data export feature, emphasize no third-party sharing
  
- **Rate Limits:** Rork Toolkit API or Convex may have undocumented rate limits
  - *Mitigation:* Implement caching, queue system, and graceful degradation
  
- **Telegram Dependency:** If Telegram is blocked/banned in a region, app is unusable
  - *Mitigation:* Plan for WhatsApp/other platform expansion
  
- **Scalability Costs:** Beyond free tier, costs may grow faster than revenue
  - *Mitigation:* Monitor usage closely, optimize function calls, consider premium tier

### Open Questions

- How will users discover the bot? (Marketing strategy undefined)
- Should we support English equally, or Arabic-first only?
- What's the optimal AI prompt structure for transaction extraction?
- How do we handle ambiguous inputs (e.g., "paid 50" - what currency? what category?)
- Should loan tracking include interest calculations?
- Do we need user authentication beyond Telegram ID?
- How to handle data export for users who want to leave?

### Areas Needing Further Research

- **Competitive Analysis:** Deep dive into existing Telegram finance bots (features, pricing, user reviews)
- **User Interviews:** Talk to 5-10 potential users about their finance tracking habits
- **Rork API Testing:** Stress test the API for rate limits, response times, and accuracy
- **Convex Limits:** Understand exact free tier limits and pricing beyond
- **Legal/Compliance:** Research data protection requirements for financial apps in target regions
- **Localization:** Determine if Egyptian Arabic vs. MSA affects AI understanding

---

## Appendices

### A. Research Summary

**Initial Findings:**
- Existing finance apps (Wallet, Money Manager) have 2.5-3.5 star ratings due to complexity
- Telegram bots in finance space are limited (mostly crypto price trackers)
- Arabic NLP has improved significantly with modern LLMs
- Convex provides real-time features that traditional backends lack

**Competitive Landscape:**
- **Traditional Apps:** Wallet, Money Manager, Spendee (complex, not Arabic-focused)
- **Telegram Bots:** Limited to simple expense logging, no AI
- **Spreadsheets:** Google Sheets templates (manual, no intelligence)

### C. References

- Convex Documentation: https://docs.convex.dev
- Telegram Bot API: https://core.telegram.org/bots/api
- Rork Toolkit API Config: `config.api.json`
- BMAD Framework: `.bmad-core/`

---

## Next Steps

### Immediate Actions

1. **Review and Refine Brief:** Stakeholder feedback on scope and priorities
2. **Competitive Research:** Analyze 3-5 existing Telegram finance bots
3. **API Testing:** Validate Rork Toolkit API capabilities with sample transactions
4. **User Interviews:** Talk to 5 potential users about their needs
5. **Handoff to PM:** Create detailed PRD based on this brief

### PM Handoff

This Project Brief provides the full context for **Personal Finance Tracker (Telegram Bot)**. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.

---

**Document Owner:** Analyst (Mary)  
**Next Agent:** Product Manager  
**Status:** Ready for PRD Creation
