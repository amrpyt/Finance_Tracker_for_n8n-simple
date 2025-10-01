/**
 * Input validation utilities for Convex functions
 * Enforces data integrity and business rules
 */

import { throwInvalidAccountName, throwInvalidBalance } from "./errors";

/**
 * Validates account name length
 * @param name - Account name to validate
 * @throws AppError if name is invalid
 */
export function validateAccountName(name: string): void {
  const trimmedName = name.trim();
  
  if (trimmedName.length < 1 || trimmedName.length > 50) {
    throwInvalidAccountName();
  }
}

/**
 * Validates account balance based on account type
 * @param balance - Initial balance to validate
 * @param type - Account type ('bank', 'cash', or 'credit')
 * @throws AppError if balance is invalid for the account type
 */
export function validateBalance(balance: number, type: string): void {
  // Credit accounts can have negative balance (debt)
  if (type === "credit") {
    return;
  }
  
  // Bank and cash accounts cannot start with negative balance
  if (balance < 0) {
    throwInvalidBalance();
  }
}

/**
 * Sanitizes account name by trimming whitespace and removing dangerous characters
 * @param name - Raw account name from user input
 * @returns Sanitized account name
 */
export function sanitizeAccountName(name: string): string {
  return name
    .trim()
    .slice(0, 50) // Enforce max length
    .replace(/[<>]/g, ""); // Remove HTML-like characters
}
