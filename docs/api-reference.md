# API Reference

**Version:** 2.0  
**Last Updated:** 2025-10-04

This document provides a reference for all major internal and external APIs used in the Personal Finance Tracker bot.

---

## External APIs

This section covers the third-party services the application integrates with.

### 1. Rork Toolkit API

- **Provider:** Rork
- **Base URL:** `https://toolkit.rork.com`
- **Authentication:** None required
- **Primary Use:** Natural Language Understanding (NLU)

**Endpoint:** `POST /text/llm/`

**Description:** Used to interpret user messages, detect intent (e.g., adding an expense, checking a balance), and extract entities (e.g., amount, description) using function-calling capabilities.

**Request Example:**
```json
{
  "model": "default",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert financial assistant..."
    },
    {
      "role": "user",
      "content": "I spent 50 egp on coffee at starbucks"
    }
  ],
  "functions": [
    {
      "name": "addExpense",
      "description": "Logs a new expense transaction.",
      "parameters": {
        "type": "object",
        "properties": {
          "amount": { "type": "number" },
          "description": { "type": "string" }
        },
        "required": ["amount", "description"]
      }
    }
  ]
}
```

**Success Response Example:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "function_call": {
          "name": "addExpense",
          "arguments": "{\"amount\":50,\"description\":\"coffee at starbucks\"}"
        }
      }
    }
  ]
}
```

### 2. Telegram Bot API

- **Provider:** Telegram
- **Base URL:** `https://api.telegram.org/bot<TOKEN>/`
- **Authentication:** Bot Token in URL
- **Primary Use:** User interaction (sending messages, photos, keyboards)

**Key Endpoints Used:**

- **`POST /sendMessage`**: Sends a text message to a user.
- **`POST /sendPhoto`**: Sends an image (used for charts).
- **`POST /answerCallbackQuery`**: Responds to button presses from inline keyboards.

**Request Example (`sendMessage`):**
```json
{
  "chat_id": 123456789,
  "text": "✅ Expense logged: 50 EGP for coffee.",
  "parse_mode": "Markdown"
}
```

### 3. QuickChart API

- **Provider:** QuickChart
- **Base URL:** `https://quickchart.io`
- **Authentication:** None required (for public charts)
- **Primary Use:** Generating chart images from data.

**Endpoint:** `POST /chart`

**Description:** Used to generate URLs for chart images that can be sent to the user via the Telegram Bot API. We send a JSON payload defining the chart type, data, and labels.

**Request Example (Pie Chart):**
```json
{
  "chart": {
    "type": "pie",
    "data": {
      "labels": ["Food", "Transport", "Shopping"],
      "datasets": [{
        "data": [500, 150, 300]
      }]
    }
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "url": "https://quickchart.io/chart/render/cf-4d1e3c1a-a263-477a-8302-9233b2c1e111"
}
```

---

## Internal API (Convex Functions)

This section describes the primary entry points and actions within our own Convex backend.

### Entry Point

- **`convex/http.ts`**: Defines the main webhook endpoint (`/telegram`) that receives all incoming updates from the Telegram Bot API. It performs initial validation and then calls the `messageProcessor` action.

### Key Public Actions

These are the core actions that orchestrate the application's logic. They are defined in the `convex/` directory.

- **`messageProcessor`**: The main router. It takes the incoming message, calls the Rork API for intent detection, and then invokes the appropriate business logic action.
- **`expenseActions`**: Contains mutations for creating, updating, and deleting expense and income transactions.
- **`balanceActions`**: Contains queries for fetching account balances and transaction histories.
- **`accountActions`**: Contains mutations for managing user financial accounts (create, set default, etc.).
- **`chartGenerator`**: Contains the action that fetches transaction data and calls the QuickChart API to generate a chart URL.
- **`telegramAPI`**: A wrapper for making calls to the Telegram Bot API (e.g., sending messages).

---

## Deprecated APIs

- **Trigger.dev API**: No longer used as of Epic 7. All orchestration is now handled directly within Convex Actions.
