/**
 * Function calling definitions for structured AI responses
 * Defines the available intents and their parameters
 */

import { RorkFunction } from "../lib/rork";

/**
 * Get all available function definitions for the AI
 */
export function getFunctionDefinitions(): RorkFunction[] {
  return [
    logExpenseFunction,
    logIncomeFunction,
    checkBalanceFunction,
    listAccountsFunction,
    searchTransactionsFunction,
    askClarificationFunction,
  ];
}

/**
 * Log expense function definition
 */
const logExpenseFunction: RorkFunction = {
  name: "log_expense",
  description: "Log a new expense transaction. Use when user mentions spending money, buying something, or paying for something.",
  parameters: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "The expense amount in EGP (Egyptian Pounds). Must be positive.",
      },
      description: {
        type: "string",
        description: "Brief description of what the expense was for (e.g., 'coffee', 'taxi', 'groceries').",
      },
      category: {
        type: "string",
        enum: [
          "Food & Drinks",
          "Transportation",
          "Shopping",
          "Bills",
          "Entertainment",
          "Health",
          "Education",
          "Other",
        ],
        description: "Category of the expense. Infer from description if not explicitly mentioned.",
      },
      accountId: {
        type: "string",
        description: "ID of the account to debit. Use 'default' if not specified by user.",
      },
      date: {
        type: "string",
        description: "Date of the expense in ISO format. Use 'today' if not specified.",
      },
      confidence: {
        type: "number",
        description: "Confidence level (0-1) in the extracted information.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of how you interpreted the user's message.",
      },
      clarification_needed: {
        type: "boolean",
        description: "Whether clarification is needed before executing (e.g., missing amount).",
      },
    },
    required: ["amount", "description", "confidence"],
  },
};

/**
 * Log income function definition
 */
const logIncomeFunction: RorkFunction = {
  name: "log_income",
  description: "Log a new income transaction. Use when user mentions receiving money, salary, payment, or earning.",
  parameters: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "The income amount in EGP (Egyptian Pounds). Must be positive.",
      },
      description: {
        type: "string",
        description: "Brief description of the income source (e.g., 'salary', 'freelance payment', 'gift').",
      },
      category: {
        type: "string",
        enum: ["Salary", "Freelance", "Investment", "Gift", "Other"],
        description: "Category of the income. Infer from description if not explicitly mentioned.",
      },
      accountId: {
        type: "string",
        description: "ID of the account to credit. Use 'default' if not specified by user.",
      },
      date: {
        type: "string",
        description: "Date of the income in ISO format. Use 'today' if not specified.",
      },
      confidence: {
        type: "number",
        description: "Confidence level (0-1) in the extracted information.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of how you interpreted the user's message.",
      },
      clarification_needed: {
        type: "boolean",
        description: "Whether clarification is needed before executing (e.g., missing amount).",
      },
    },
    required: ["amount", "description", "confidence"],
  },
};

/**
 * Check balance function definition
 */
const checkBalanceFunction: RorkFunction = {
  name: "check_balance",
  description: "Check account balance(s). Use when user asks about their balance, how much money they have, or account status.",
  parameters: {
    type: "object",
    properties: {
      accountId: {
        type: "string",
        description: "Specific account ID to check. Use 'all' to show all accounts.",
      },
      confidence: {
        type: "number",
        description: "Confidence level (0-1) in understanding the request.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of how you interpreted the user's message.",
      },
    },
    required: ["confidence"],
  },
};

/**
 * List accounts function definition
 */
const listAccountsFunction: RorkFunction = {
  name: "list_accounts",
  description: "List all user accounts. Use when user asks to see their accounts, wants to know what accounts they have, or needs to choose an account.",
  parameters: {
    type: "object",
    properties: {
      confidence: {
        type: "number",
        description: "Confidence level (0-1) in understanding the request.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of how you interpreted the user's message.",
      },
    },
    required: ["confidence"],
  },
};

/**
 * Search transactions function definition
 */
const searchTransactionsFunction: RorkFunction = {
  name: "search_transactions",
  description: "Search and filter transactions. Use when user asks about past expenses/income, spending patterns, or wants to see transaction history.",
  parameters: {
    type: "object",
    properties: {
      dateRange: {
        type: "object",
        properties: {
          start: {
            type: "string",
            description: "Start date in ISO format or relative (e.g., 'this week', 'last month').",
          },
          end: {
            type: "string",
            description: "End date in ISO format or 'today'.",
          },
        },
        description: "Date range to search within.",
      },
      category: {
        type: "string",
        description: "Filter by specific category (e.g., 'Food & Drinks', 'Transportation').",
      },
      type: {
        type: "string",
        enum: ["expense", "income", "all"],
        description: "Filter by transaction type.",
      },
      minAmount: {
        type: "number",
        description: "Minimum amount filter.",
      },
      maxAmount: {
        type: "number",
        description: "Maximum amount filter.",
      },
      accountId: {
        type: "string",
        description: "Filter by specific account.",
      },
      aggregation: {
        type: "string",
        enum: ["sum", "count", "average", "none"],
        description: "How to aggregate results (e.g., 'sum' for total spending).",
      },
      confidence: {
        type: "number",
        description: "Confidence level (0-1) in understanding the request.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of how you interpreted the user's message.",
      },
      clarification_needed: {
        type: "boolean",
        description: "Whether clarification is needed (e.g., ambiguous date range).",
      },
    },
    required: ["confidence"],
  },
};

/**
 * Ask clarification function definition
 */
const askClarificationFunction: RorkFunction = {
  name: "ask_clarification",
  description: "Ask user for clarification when the intent or required information is unclear or ambiguous.",
  parameters: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "The clarification question to ask the user.",
      },
      options: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Optional: Multiple choice options for the user to select from.",
      },
      missingInfo: {
        type: "array",
        items: {
          type: "string",
        },
        description: "List of missing information fields (e.g., ['amount', 'description']).",
      },
      partialData: {
        type: "object",
        description: "Any data that was successfully extracted, to be used when user provides missing info.",
      },
      confidence: {
        type: "number",
        description: "Confidence level (0-1) - should be low (<0.7) when asking for clarification.",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of why clarification is needed.",
      },
    },
    required: ["question", "confidence", "reasoning"],
  },
};

/**
 * Helper function to get function definition by name
 */
export function getFunctionByName(name: string): RorkFunction | undefined {
  return getFunctionDefinitions().find((fn) => fn.name === name);
}

/**
 * Validate if a function call has all required parameters
 */
export function validateFunctionCall(
  functionName: string,
  args: Record<string, any>
): { valid: boolean; missingParams: string[] } {
  const func = getFunctionByName(functionName);
  
  if (!func) {
    return { valid: false, missingParams: [] };
  }
  
  const required = func.parameters.required || [];
  const missingParams = required.filter((param) => !(param in args));
  
  return {
    valid: missingParams.length === 0,
    missingParams,
  };
}
