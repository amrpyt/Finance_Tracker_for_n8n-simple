/**
 * Account management functions
 * Handles CRUD operations for user accounts
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateAccountName, validateBalance, sanitizeAccountName } from "./lib/validation";
import { throwInternalError, AppError } from "./lib/errors";

/**
 * Creates a new account for a user
 * 
 * @param userId - ID of the user creating the account
 * @param name - Account name (1-50 characters)
 * @param type - Account type: "bank", "cash", or "credit"
 * @param initialBalance - Starting balance (cannot be negative for bank/cash)
 * 
 * @returns Account ID and details
 * @throws AppError if validation fails
 */
export const createAccount = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("bank"), v.literal("cash"), v.literal("credit")),
    initialBalance: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      validateAccountName(args.name);
      validateBalance(args.initialBalance, args.type);
      
      // Sanitize account name
      const sanitizedName = sanitizeAccountName(args.name);
      
      // Create account in database
      const accountId = await ctx.db.insert("accounts", {
        userId: args.userId,
        name: sanitizedName,
        type: args.type,
        balance: args.initialBalance,
        currency: "EGP", // Default currency for MVP
        createdAt: Date.now(),
      });
      
      // Return account details
      return {
        accountId,
        name: sanitizedName,
        type: args.type,
        balance: args.initialBalance,
        currency: "EGP",
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      // Log unexpected errors and throw generic error
      console.error("Unexpected error in createAccount:", error);
      throwInternalError();
    }
  },
});

/**
 * Gets all accounts for a specific user
 * 
 * @param userId - ID of the user
 * @returns Array of user's accounts
 */
export const getUserAccounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
