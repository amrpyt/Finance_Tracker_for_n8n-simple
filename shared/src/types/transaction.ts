/**
 * Transaction type definitions
 * Shared between bot server and Convex backend
 */

export type TransactionType = "expense" | "income";

export interface Transaction {
  _id: string; // Convex document ID
  userId: string; // Reference to users table
  accountId: string; // Reference to accounts table
  type: TransactionType;
  amount: number; // Positive number
  description: string; // Max 200 characters
  category: string; // From predefined categories
  date: number; // Timestamp
  isDeleted: boolean; // Soft delete flag
  createdAt: number; // Creation timestamp
  updatedAt?: number; // Last update timestamp
}

export interface CreateTransactionArgs {
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: number;
}

export interface CreateTransactionResult {
  transactionId: string;
  newBalance: number;
}
