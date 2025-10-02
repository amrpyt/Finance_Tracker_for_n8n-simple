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
      
      // Check if this is the user's first account
      const existingAccounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      
      const isFirstAccount = existingAccounts.length === 0;
      
      // Create account in database
      const accountId = await ctx.db.insert("accounts", {
        userId: args.userId,
        name: sanitizedName,
        type: args.type,
        balance: args.initialBalance,
        currency: "EGP", // Default currency for MVP
        isDefault: isFirstAccount, // First account is automatically default
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

/**
 * Sets an account as the default for a user
 * Atomically removes default flag from previous default account
 * 
 * @param userId - ID of the user
 * @param accountId - ID of the account to set as default
 * @returns Updated account details
 * @throws AppError if account not found or doesn't belong to user
 */
export const setDefaultAccount = mutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    try {
      // Verify account exists and belongs to user
      const account = await ctx.db.get(args.accountId);
      
      if (!account) {
        throw new AppError("ACCOUNT_NOT_FOUND", {
          en: "Account not found. Please check the account name and try again.",
          ar: "لم يتم العثور على الحساب. يرجى التحقق من اسم الحساب والمحاولة مرة أخرى.",
        });
      }
      
      if (account.userId !== args.userId) {
        throw new AppError("UNAUTHORIZED", {
          en: "You cannot modify this account.",
          ar: "لا يمكنك تعديل هذا الحساب.",
        });
      }
      
      // If already default, return early (idempotent)
      if (account.isDefault) {
        return {
          accountId: args.accountId,
          name: account.name,
          isDefault: true,
          alreadyDefault: true,
        };
      }
      
      // Find current default account and remove default flag
      const currentDefault = await ctx.db
        .query("accounts")
        .withIndex("by_user_default", (q) => 
          q.eq("userId", args.userId).eq("isDefault", true)
        )
        .first();
      
      if (currentDefault) {
        await ctx.db.patch(currentDefault._id, {
          isDefault: false,
        });
      }
      
      // Set new account as default
      await ctx.db.patch(args.accountId, {
        isDefault: true,
      });
      
      return {
        accountId: args.accountId,
        name: account.name,
        isDefault: true,
        alreadyDefault: false,
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      // Log unexpected errors and throw generic error
      console.error("Unexpected error in setDefaultAccount:", error);
      throwInternalError();
    }
  },
});
