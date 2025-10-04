/**
 * Input validation utilities for Convex functions
 * Enforces data integrity and business rules
 */

import { 
  throwInvalidAccountName, 
  throwInvalidBalance,
  throwInvalidAmount,
  throwInvalidDescription,
  throwInvalidCategory
} from "./errors";

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

/**
 * Validates transaction amount
 * @param amount - Transaction amount to validate
 * @throws AppError if amount is not positive
 */
export function validateAmount(amount: number): void {
  if (amount <= 0 || !isFinite(amount)) {
    throwInvalidAmount();
  }
}

/**
 * Validates transaction description
 * @param description - Transaction description to validate
 * @throws AppError if description is invalid
 */
export function validateDescription(description: string): void {
  const trimmed = description.trim();
  
  if (trimmed.length < 1 || trimmed.length > 200) {
    throwInvalidDescription();
  }
}

/**
 * Validates transaction category
 * @param category - Transaction category to validate
 * @throws AppError if category is invalid
 */
export function validateCategory(category: string): void {
  const validCategories = [
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Education",
    "Other",
    "Income",
    "Salary",
    "Gift",
  ];
  
  if (!validCategories.includes(category)) {
    throwInvalidCategory();
  }
}

/**
 * Sanitizes transaction description
 * @param description - Raw description from user input
 * @returns Sanitized description
 */
export function sanitizeDescription(description: string): string {
  return description
    .trim()
    .slice(0, 200) // Enforce max length
    .replace(/[<>]/g, ""); // Remove HTML-like characters
}
