# Source Tree Structure

**Version:** 1.0  
**Last Updated:** 2025-09-30

This document defines the complete directory structure for the Personal Finance Tracker Telegram Bot monorepo.

---

## Complete Directory Tree

```
finance-tracker-telegram-bot/
│
├── .github/                              # GitHub configuration
│   └── workflows/                        # CI/CD workflows
│       ├── ci.yaml                       # Run tests on pull requests
│       ├── deploy.yaml                   # Deploy to production
│       └── lint.yaml                     # Code quality checks
│
├── bot/                                  # Telegram bot server
│   ├── src/                              # Source code
│   │   ├── index.ts                      # Main entry point (Express server)
│   │   ├── bot.ts                        # Telegram bot initialization
│   │   │
│   │   ├── config/                       # Configuration
│   │   │   ├── env.ts                    # Environment variable loading
│   │   │   └── convex.ts                 # Convex client setup
│   │   │
│   │   ├── handlers/                     # Message and command handlers
│   │   │   ├── index.ts                  # Handler registration
│   │   │   ├── commands.ts               # /start, /help commands
│   │   │   ├── messages.ts               # Natural language message handling
│   │   │   ├── callbacks.ts              # Callback query handling
│   │   │   └── confirmations.ts          # Confirmation flow handling
│   │   │
│   │   ├── services/                     # Business logic services
│   │   │   ├── convex.ts                 # Convex function call wrappers
│   │   │   ├── session.ts                # In-memory session management
│   │   │   └── rateLimiter.ts            # Rate limiting logic
│   │   │
│   │   ├── utils/                        # Utility functions
│   │   │   ├── telegram.ts               # Telegram formatting utilities
│   │   │   ├── language.ts               # Arabic/English detection
│   │   │   ├── logger.ts                 # Logging utilities
│   │   │   ├── errorHandler.ts           # Error handling and translation
│   │   │   └── formatters.ts             # Message formatting
│   │   │
│   │   └── types/                        # TypeScript type definitions
│   │       ├── index.ts                  # Main type exports
│   │       ├── session.ts                # Session types
│   │       └── telegram.ts               # Telegram-specific types
│   │
│   ├── tests/                            # Unit and integration tests
│   │   ├── handlers/
│   │   │   ├── commands.test.ts
│   │   │   └── messages.test.ts
│   │   ├── services/
│   │   │   ├── session.test.ts
│   │   │   └── rateLimiter.test.ts
│   │   └── utils/
│   │       ├── language.test.ts
│   │       └── formatters.test.ts
│   │
│   ├── .env.example                      # Environment variable template
│   ├── .eslintrc.json                    # ESLint configuration
│   ├── .prettierrc                       # Prettier configuration
│   ├── jest.config.js                    # Jest test configuration
│   ├── package.json                      # Bot dependencies
│   ├── tsconfig.json                     # TypeScript configuration
│   └── README.md                         # Bot server documentation
│
├── convex/                               # Convex backend
│   ├── schema.ts                         # Database schema definition
│   │
│   ├── users.ts                          # User management functions
│   ├── accounts.ts                       # Account CRUD operations
│   ├── transactions.ts                   # Transaction management
│   ├── loans.ts                          # Loan tracking functions
│   ├── ai.ts                             # AI integration actions
│   │
│   ├── lib/                              # Shared backend utilities
│   │   ├── rork.ts                       # Rork API client
│   │   ├── validation.ts                 # Input validation utilities
│   │   ├── calculations.ts               # Balance calculation logic
│   │   ├── errors.ts                     # Error classes and helpers
│   │   ├── auth.ts                       # Authentication helpers
│   │   │
│   │   └── repositories/                 # Data access layer
│   │       ├── accountRepository.ts      # Account data access
│   │       ├── transactionRepository.ts  # Transaction data access
│   │       └── loanRepository.ts         # Loan data access
│   │
│   ├── prompts/                          # AI system prompts
│   │   ├── system.ts                     # Main system prompt
│   │   ├── functions.ts                  # Function calling definitions
│   │   └── categories.ts                 # Category classification prompts
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
| `bot/` | Telegram bot server application |
| `convex/` | Convex serverless backend |
| `shared/` | Shared TypeScript types and utilities |
| `docs/` | All project documentation |
| `scripts/` | Build, deployment, and utility scripts |
| `package.json` | Root package.json defining npm workspaces |
| `config.api.json` | Rork API configuration and rate limits |

### Bot Server (`bot/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/` | All bot source code | `index.ts`, `bot.ts` |
| `src/config/` | Configuration loading | `env.ts`, `convex.ts` |
| `src/handlers/` | Telegram event handlers | `commands.ts`, `messages.ts` |
| `src/services/` | Business logic services | `convex.ts`, `session.ts` |
| `src/utils/` | Utility functions | `telegram.ts`, `logger.ts` |
| `src/types/` | TypeScript type definitions | `session.ts`, `telegram.ts` |
| `tests/` | Unit and integration tests | `*.test.ts` |

### Convex Backend (`convex/`)

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| Root | Convex functions (queries, mutations, actions) | `users.ts`, `transactions.ts` |
| `lib/` | Shared backend utilities | `rork.ts`, `validation.ts` |
| `lib/repositories/` | Data access layer | `accountRepository.ts` |
| `prompts/` | AI system prompts | `system.ts`, `functions.ts` |
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
// Bot server - use path aliases
import { convexClient } from "@/services/convex";
import { logger } from "@/utils/logger";
import { User } from "@shared/types/user";

// Convex - use relative imports (Convex limitation)
import { AppError } from "./lib/errors";
import { validateAmount } from "./lib/validation";
```

### Path Alias Configuration

```json
// bot/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/src/*"]
    }
  }
}
```

---

## Key Files Reference

### Entry Points

| File | Purpose |
|------|---------|
| `bot/src/index.ts` | Bot server entry point (Express + webhook) |
| `convex/schema.ts` | Database schema definition |

### Configuration Files

| File | Purpose |
|------|---------|
| `config.api.json` | Rork API endpoints and rate limits |
| `bot/.env` | Bot server environment variables |
| `convex/.env.local` | Convex environment variables |
| `.env.example` | Environment variable template |

### Core Business Logic

| File | Purpose |
|------|---------|
| `convex/users.ts` | User management (create, get) |
| `convex/accounts.ts` | Account CRUD operations |
| `convex/transactions.ts` | Transaction management |
| `convex/loans.ts` | Loan tracking and payments |
| `convex/ai.ts` | Rork API integration |

### Bot Handlers

| File | Purpose |
|------|---------|
| `bot/src/handlers/commands.ts` | /start, /help commands |
| `bot/src/handlers/messages.ts` | Natural language processing |
| `bot/src/handlers/confirmations.ts` | User confirmation flows |

### Utilities

| File | Purpose |
|------|---------|
| `bot/src/utils/logger.ts` | Structured logging |
| `bot/src/utils/language.ts` | Arabic/English detection |
| `convex/lib/rork.ts` | Rork API client |
| `convex/lib/errors.ts` | Error handling utilities |

---

## Gitignore Patterns

```gitignore
# Dependencies
node_modules/
package-lock.json

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
  "workspaces": [
    "bot",
    "convex",
    "shared"
  ],
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:bot": "npm run dev --workspace=bot",
    "dev:convex": "npm run dev --workspace=convex",
    "test": "npm run test --workspaces",
    "build": "npm run build --workspaces",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "npm-run-all": "^4.1.5",
    "typescript": "^5.3.0"
  }
}
```

---

## File Size Guidelines

### Maximum File Sizes

| File Type | Max Lines | Rationale |
|-----------|-----------|-----------|
| Convex function file | 300 lines | Keep functions focused and testable |
| Bot handler file | 400 lines | Handlers can be more complex |
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

**Add `bot/src/middleware/` when:**
- Need more than 2 middleware functions
- Example: auth middleware, logging middleware

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
**Last Reviewed:** 2025-09-30
