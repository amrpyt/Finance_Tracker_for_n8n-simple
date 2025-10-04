/**
 * Transaction management functions
 * Handles expense and income logging with atomic balance updates
 */

import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  validateAmount,
  validateDescription,
  validateCategory,
  sanitizeDescription,
} from "./lib/validation";
import {
  throwInternalError,
  throwAccountNotFound,
  throwUnauthorized,
  throwTransactionNotFound,
  AppError,
} from "./lib/errors";

/**
 * Creates a new transaction and updates account balance atomically
 * 
 * @param userId - ID of the user creating the transaction
 * @param accountId - ID of the account to debit/credit
 * @param type - "expense" or "income"
 * @param amount - Transaction amount (must be positive)
 * @param description - Transaction description (max 200 chars)
 * @param category - Transaction category (from predefined list)
 * @param date - Transaction date (timestamp, optional, defaults to now)
 * 
 * @returns Transaction ID and updated account balance
 * @throws AppError if validation fails or account not found
 */
export const createTransaction = internalMutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("accounts"),
    type: v.union(v.literal("expense"), v.literal("income")),
    amount: v.number(),
    description: v.string(),
    category: v.string(),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      validateAmount(args.amount);
      validateDescription(args.description);
      validateCategory(args.category);

      // Sanitize description
      const sanitizedDescription = sanitizeDescription(args.description);

      // Verify account exists and belongs to user
      const account = await ctx.db.get(args.accountId);

      if (!account) {
        throwAccountNotFound();
      }

      if (account.userId !== args.userId) {
        throwUnauthorized();
      }

      // Calculate new balance
      const balanceChange = args.type === "expense" ? -args.amount : args.amount;
      const newBalance = account.balance + balanceChange;

      // Insert transaction record
      const transactionId = await ctx.db.insert("transactions", {
        userId: args.userId,
        accountId: args.accountId,
        type: args.type,
        amount: args.amount,
        description: sanitizedDescription,
        category: args.category,
        date: args.date || Date.now(),
        isDeleted: false,
        createdAt: Date.now(),
      });

      // Update account balance atomically in same mutation
      await ctx.db.patch(args.accountId, {
        balance: newBalance,
      });

      return {
        transactionId,
        newBalance,
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log unexpected errors and throw generic error
      console.error("Unexpected error in createTransaction:", error);
      throwInternalError();
    }
  },
});

/**
 * Get recent transactions for a user
 * Used by AI for context awareness and transaction history display
 * 
 * @param userId - ID of the user
 * @param limit - Maximum number of transactions to return (default: 3)
 * @returns Array of recent transactions (non-deleted only)
 */
export const getRecentTransactions = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;

    return await ctx.db
      .query("transactions")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", args.userId).eq("isDeleted", false)
      )
      .order("desc")
      .take(limit);
  },
});

/**
 * Get transactions for a user within a date range
 * 
 * @param userId - ID of the user
 * @param startDate - Start date timestamp
 * @param endDate - End date timestamp
 * @returns Array of transactions within the date range
 */
export const getTransactionsByDateRange = internalQuery({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    return allTransactions.filter(
      (t) => t.date >= args.startDate && t.date <= args.endDate
    );
  },
});

/**
 * Get transactions by period (internal - called from chart generator)
 * 
 * @param userId - ID of the user (as string from Telegram)
 * @param startDate - Start date as ISO string
 * @param endDate - End date as ISO string
 * @returns Array of transactions within the period
 */
export const getTransactionsByPeriod = internalQuery({
  args: {
    userId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by Telegram ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_telegram_id", (q) => q.eq("telegramUserId", args.userId))
      .first();
    
    if (!user) {
      return [];
    }

    const startTimestamp = new Date(args.startDate).getTime();
    const endTimestamp = new Date(args.endDate).getTime();

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    return allTransactions.filter(
      (t) => t.date >= startTimestamp && t.date <= endTimestamp
    );
  },
});

/**
 * Soft delete a transaction (sets isDeleted flag)
 * Also reverses the balance change on the account
 * 
 * @param userId - ID of the user
 * @param transactionId - ID of the transaction to delete
 * @throws AppError if transaction not found or unauthorized
 */
export const deleteTransaction = mutation({
  args: {
    userId: v.id("users"),
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    try {
      // Verify transaction exists and belongs to user
      const transaction = await ctx.db.get(args.transactionId);

      if (!transaction) {
        throwTransactionNotFound();
      }

      if (transaction.userId !== args.userId) {
        throwUnauthorized();
      }

      // Don't delete if already deleted (idempotent)
      if (transaction.isDeleted) {
        const account = await ctx.db.get(transaction.accountId);
        return {
          success: true,
          alreadyDeleted: true,
          balance: account?.balance || 0,
        };
      }

      // Get account to update balance
      const account = await ctx.db.get(transaction.accountId);

      if (!account) {
        throwAccountNotFound();
      }

      // Reverse the balance change
      const balanceChange = transaction.type === "expense" ? transaction.amount : -transaction.amount;
      const newBalance = account.balance + balanceChange;

      // Soft delete transaction
      await ctx.db.patch(args.transactionId, {
        isDeleted: true,
        updatedAt: Date.now(),
      });

      // Update account balance
      await ctx.db.patch(transaction.accountId, {
        balance: newBalance,
      });

      return {
        success: true,
        alreadyDeleted: false,
        balance: newBalance,
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Log unexpected errors and throw generic error
      console.error("Unexpected error in deleteTransaction:", error);
      throwInternalError();
    }
  },
});
