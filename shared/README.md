# Shared Package

This directory contains shared TypeScript types, constants, and utilities used across the bot server and Convex backend.

## Structure

- `src/types/` - Shared TypeScript interfaces and type definitions
- `src/constants/` - Shared constants (categories, currencies, messages)
- `src/utils/` - Shared utility functions (formatters, validators)

## Purpose

The shared package ensures type consistency between the bot server and Convex backend, reducing duplication and preventing type mismatches.

## Usage

Import shared types in bot or Convex:

```typescript
// In bot server
import { User } from "@shared/types/user";

// In Convex (use relative path)
import { User } from "../shared/src/types/user";
```

## Development

```bash
# Build shared package
npm run build

# Lint code
npm run lint
```
