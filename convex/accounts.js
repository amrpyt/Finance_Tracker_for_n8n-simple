"use strict";
/**
 * Account management functions
 * Handles CRUD operations for user accounts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAccounts = exports.createAccount = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
const validation_1 = require("./lib/validation");
const errors_1 = require("./lib/errors");
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
exports.createAccount = (0, server_1.mutation)({
    args: {
        userId: values_1.v.id("users"),
        name: values_1.v.string(),
        type: values_1.v.union(values_1.v.literal("bank"), values_1.v.literal("cash"), values_1.v.literal("credit")),
        initialBalance: values_1.v.number(),
    },
    handler: async (ctx, args) => {
        try {
            // Validate inputs
            (0, validation_1.validateAccountName)(args.name);
            (0, validation_1.validateBalance)(args.initialBalance, args.type);
            // Sanitize account name
            const sanitizedName = (0, validation_1.sanitizeAccountName)(args.name);
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
        }
        catch (error) {
            // Re-throw AppError instances
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            // Log unexpected errors and throw generic error
            console.error("Unexpected error in createAccount:", error);
            (0, errors_1.throwInternalError)();
        }
    },
});
/**
 * Gets all accounts for a specific user
 *
 * @param userId - ID of the user
 * @returns Array of user's accounts
 */
exports.getUserAccounts = (0, server_1.query)({
    args: { userId: values_1.v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("accounts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});
