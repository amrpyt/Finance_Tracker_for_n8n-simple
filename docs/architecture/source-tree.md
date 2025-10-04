# Source Tree Structure

**Version:** 2.0  
**Last Updated:** 2025-10-04

This document defines the complete directory structure for the Personal Finance Tracker Telegram Bot monorepo.

---

## Complete Directory Tree

```text
finance-tracker-telegram-bot/
│
├── .github/                              # GitHub configuration
│   └── workflows/                        # CI/CD workflows
│       ├── ci.yaml                       # Run tests on pull requests
│       ├── deploy.yaml                   # Deploy to production
│       └── lint.yaml                     # Code quality checks
│
├── convex/                               # Convex serverless backend (100% of application)
│   ├── schema.ts                         # Database schema definition
│   │
│   ├── telegram.ts                       # Telegram webhook HTTP Action (entry point)
│   ├── messageProcessor.ts               # Main message routing & AI integration
│   ├── expenseActions.ts                 # Expense/income processing
│   ├── balanceActions.ts                 # Balance checking & transaction history
│   ├── chartGenerator.ts                 # Chart generation (QuickChart API)
│   ├── telegramAPI.ts                    # Telegram Bot API client
│   ├── rorkIntegration.ts                # RORK AI processing
│   ├── userProfiles.ts                   # User management & preferences
│   ├── users.ts                          # User CRUD operations
│   ├── accounts.ts                       # Account management
│   ├── transactions.ts                   # Transaction operations
│   ├── messages.ts                       # Message history
│   ├── ai.ts                             # AI integration actions
│   ├── http.ts                           # HTTP action exports
│   │
│   ├── lib/                              # Shared backend utilities
│   │   ├── validation.ts                 # Input validation utilities
│   │   ├── calculations.ts               # Balance calculation logic
│   │   └── errors.ts                     # Error classes and helpers
│   │
│   ├── prompts/                          # AI system prompts
│   │   ├── system.ts                     # Main system prompt
│   │   └── functions.ts                  # Function calling definitions
│   │
│   ├── tests/                            # Convex function tests
│   │   ├── users.test.ts
│   │   ├── accounts.test.ts
│   │   ├── transactions.test.ts
│   │   ├── loans.test.ts
│   │   └── lib/
│   │       ├── validation.test.ts
│   │       └── calculations.test.ts
│   │
│   ├── _generated/                       # Convex generated files (gitignored)
│   │   ├── api.d.ts
│   │   ├── dataModel.d.ts
│   │   └── server.d.ts
│   │
│   ├── convex.json                       # Convex project configuration
│   ├── package.json                      # Convex dependencies
│   ├── tsconfig.json                     # TypeScript configuration
│   └── README.md                         # Convex backend documentation
│
├── shared/                               # Shared types and utilities
│   ├── src/
│   │   ├── types/                        # Shared TypeScript interfaces
│   │   │   ├── index.ts                  # Main type exports
│   │   │   ├── user.ts                   # User types
│   │   │   ├── account.ts                # Account types
│   │   │   ├── transaction.ts            # Transaction types
│   │   │   ├── loan.ts                   # Loan types
│   │   │   └── error.ts                  # Error types
│   │   │
│   │   ├── constants/                    # Shared constants
│   │   │   ├── categories.ts             # Transaction categories
│   │   │   ├── currencies.ts             # Currency codes
│   │   │   └── messages.ts               # Shared message templates
│   │   │
│   │   └── utils/                        # Shared utilities
│   │       ├── formatters.ts             # Formatting functions
│   │       └── validators.ts             # Validation functions
│   │
│   ├── package.json                      # Shared package config
│   ├── tsconfig.json                     # TypeScript configuration
│   └── README.md                         # Shared package documentation
│
├── docs/                                 # Project documentation
│   ├── prd.md                            # Product Requirements Document
│   ├── architecture.md                   # Main architecture document
│   ├── api-reference.md                  # API documentation
│   ├── brief.md                          # Project brief
│   │
│   └── architecture/                     # Detailed architecture docs
│       ├── tech-stack.md                 # Technology stack reference
│       ├── coding-standards.md           # Coding standards
│       ├── source-tree.md                # This document
│       ├── deployment.md                 # Deployment guide
│       └── testing-strategy.md           # Testing approach
│
├── scripts/                              # Build and deployment scripts
│   ├── setup.sh                          # Initial project setup
│   ├── deploy.sh                         # Production deployment
│   ├── test-all.sh                       # Run all tests
│   └── seed-data.ts                      # Seed test data
│
├── .env.example                          # Root environment template
├── .gitignore                            # Git ignore patterns
├── .prettierrc                           # Prettier configuration
├── .eslintrc.json                        # ESLint configuration
├── package.json                          # Root package.json (workspaces)
├── package-lock.json                     # Dependency lock file
├── tsconfig.json                         # Root TypeScript config
├── config.api.json                       # Rork API configuration
├── LICENSE                               # Project license
└── README.md                             # Main project README
```

---

## Directory Purposes

### Root Level

| Directory/File | Purpose |
|----------------|---------|
| `.github/` | GitHub-specific configuration (Actions, issue templates) |
| `convex/` | **Complete serverless backend** - 100% of application logic |
| `shared/` | Shared TypeScript types and utilities |
| `docs/` | All project documentation |
| `scripts/` | Build, deployment, and utility scripts |
| `package.json` | Root package.json (Convex-only dependencies) |
| `config.api.json` | RORK API configuration and rate limits |


### Convex Backend (`convex/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| Root | Convex functions (queries, mutations, actions, HTTP actions) | `telegram.ts`, `messageProcessor.ts`, `expenseActions.ts` |
| `lib/` | Shared backend utilities | `validation.ts`, `calculations.ts`, `errors.ts` |
| `prompts/` | AI system prompts for RORK | `system.ts`, `functions.ts` |
| `tests/` | Convex function tests | `*.test.ts` |
| `_generated/` | Convex auto-generated files (gitignored) | `api.d.ts`, `dataModel.d.ts` |

### Shared Package (`shared/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/types/` | Shared TypeScript interfaces | `user.ts`, `transaction.ts` |
| `src/constants/` | Shared constants | `categories.ts`, `currencies.ts` |
| `src/utils/` | Shared utility functions | `formatters.ts`, `validators.ts` |

---

## File Naming Conventions

### TypeScript Files

```
camelCase for code files:
  ✅ userService.ts
  ✅ transactionRepository.ts
  ✅ rorkClient.ts

PascalCase for component-like files (if any):
  ✅ UserProfile.tsx (not applicable for this project)

kebab-case for test files:
  ✅ user-service.test.ts
  OR camelCase with .test suffix:
  ✅ userService.test.ts
```

### Configuration Files

```
kebab-case for config files:
  ✅ tsconfig.json
  ✅ config.api.json
  ✅ .eslintrc.json
```

### Documentation Files

```
kebab-case for markdown:
  ✅ tech-stack.md
  ✅ coding-standards.md
  ✅ api-reference.md
```

---

## Import Path Conventions

### Absolute Imports (Preferred)

```typescript
// Convex - use relative imports (Convex limitation)
import { AppError } from "./lib/errors";
import { validateAmount } from "./lib/validation";
```


---

## Key Files Reference

### Entry Points

| File | Purpose |
|------|---------|
| `convex/telegram.ts` | Main entry point (Telegram webhook HTTP Action) |
| `convex/schema.ts` | Database schema definition |

### Configuration Files

| File | Purpose |
|------|---------|
| `config.api.json` | Rork API endpoints and rate limits |
| `.env` | Environment variables (loaded by Convex) |
| `.env.example` | Environment variable template |

### Core Business Logic

| File | Purpose |
|------|---------|
| `convex/telegram.ts` | Telegram webhook HTTP Action (entry point) |
| `convex/messageProcessor.ts` | Main message routing and AI integration |
| `convex/expenseActions.ts` | Expense and income processing |
| `convex/balanceActions.ts` | Balance checking and transaction history |
| `convex/accounts.ts` | Account management |
| `convex/chartGenerator.ts` | Chart generation with QuickChart API |
| `convex/rorkIntegration.ts` | RORK AI client and processing |
| `convex/telegramAPI.ts` | Telegram Bot API client |
| `convex/userProfiles.ts` | User management and preferences |

### Utilities

| File | Purpose |
|------|---------|
| `convex/lib/validation.ts` | Input validation utilities |
| `convex/lib/calculations.ts` | Balance calculation logic |
| `convex/lib/errors.ts` | Error handling utilities |

---

## Gitignore Patterns

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.tsbuildinfo

# Convex generated files
convex/_generated/

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
```

---

## Workspace Configuration

### Root `package.json`

```json
{
  "name": "finance-tracker-telegram-bot",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "npx convex dev",
    "deploy": "npx convex deploy",
    "test": "echo \"No tests specified\"",
    "lint": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  },
  "devDependencies": {
    "prettier": "^3.1.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "convex": "^1.27.3"
  }
}
```

---

## File Size Guidelines

### Maximum File Sizes

| File Type | Max Lines | Rationale |
|-----------|-----------|-----------|
| Convex function file | 300 lines | Keep functions focused and testable |
| Utility file | 200 lines | Utilities should be small and reusable |
| Test file | 500 lines | Tests can be verbose |
| Type definition file | 150 lines | Keep types organized and focused |

**When to split files:**
- If a file exceeds max lines, split by responsibility
- Create subdirectories for related functionality
- Example: `handlers/expenses/`, `handlers/loans/`

---

## Development Workflow Files

### Scripts Directory

```bash
scripts/
├── setup.sh              # Initial project setup
├── deploy.sh             # Production deployment
├── test-all.sh           # Run all tests
├── seed-data.ts          # Seed test data for development
└── check-env.sh          # Validate environment variables
```

### CI/CD Workflows

```yaml
.github/workflows/
├── ci.yaml               # Run tests on PR
├── deploy.yaml           # Deploy to production
├── lint.yaml             # Code quality checks
└── security.yaml         # Security scanning
```

---

## Documentation Structure

```
docs/
├── prd.md                          # Product Requirements
├── architecture.md                 # Main architecture doc
├── api-reference.md                # API documentation
├── brief.md                        # Project brief
│
├── architecture/                   # Detailed architecture
│   ├── tech-stack.md
│   ├── coding-standards.md
│   ├── source-tree.md              # This document
│   ├── deployment.md
│   └── testing-strategy.md
│
└── guides/                         # Developer guides (future)
    ├── getting-started.md
    ├── adding-features.md
    └── troubleshooting.md
```

---

## Growth Patterns

### When to Add New Directories


**Add `convex/migrations/` when:**
- Need to run data migrations
- Example: schema changes requiring data transformation

**Add `shared/src/hooks/` when:**
- Create reusable React hooks (if adding web UI later)

**Add `e2e/` at root when:**
- Implement automated E2E tests with Playwright

---

**Document Owner:** Architect  
**Review Frequency:** Updated when directory structure changes  
**Last Reviewed:** 2025-10-04

