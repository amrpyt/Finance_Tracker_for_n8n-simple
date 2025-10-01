"use strict";
/**
 * Input validation utilities for Convex functions
 * Enforces data integrity and business rules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAccountName = validateAccountName;
exports.validateBalance = validateBalance;
exports.sanitizeAccountName = sanitizeAccountName;
const errors_1 = require("./errors");
/**
 * Validates account name length
 * @param name - Account name to validate
 * @throws AppError if name is invalid
 */
function validateAccountName(name) {
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
        (0, errors_1.throwInvalidAccountName)();
    }
}
/**
 * Validates account balance based on account type
 * @param balance - Initial balance to validate
 * @param type - Account type ('bank', 'cash', or 'credit')
 * @throws AppError if balance is invalid for the account type
 */
function validateBalance(balance, type) {
    // Credit accounts can have negative balance (debt)
    if (type === "credit") {
        return;
    }
    // Bank and cash accounts cannot start with negative balance
    if (balance < 0) {
        (0, errors_1.throwInvalidBalance)();
    }
}
/**
 * Sanitizes account name by trimming whitespace and removing dangerous characters
 * @param name - Raw account name from user input
 * @returns Sanitized account name
 */
function sanitizeAccountName(name) {
    return name
        .trim()
        .slice(0, 50) // Enforce max length
        .replace(/[<>]/g, ""); // Remove HTML-like characters
}
