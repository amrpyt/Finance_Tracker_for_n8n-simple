"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Database schema (JavaScript version for Docker Convex compatibility)
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    users: (0, server_1.defineTable)({
        telegramUserId: values_1.v.string(), // Telegram user ID (unique identifier)
        username: values_1.v.optional(values_1.v.string()), // Telegram username (may not exist)
        firstName: values_1.v.string(), // User's first name from Telegram
        languagePreference: values_1.v.string(), // "ar" or "en"
        createdAt: values_1.v.number(), // Timestamp of user creation
    })
        .index("by_telegram_id", ["telegramUserId"]), // Index for fast lookups
    accounts: (0, server_1.defineTable)({
        userId: values_1.v.id("users"), // Reference to users table
        name: values_1.v.string(), // Account name (e.g., "Main Bank", "Cash Wallet")
        type: values_1.v.union(values_1.v.literal("bank"), values_1.v.literal("cash"), values_1.v.literal("credit")), // Account type: bank, cash, or credit
        balance: values_1.v.number(), // Current balance
        currency: values_1.v.string(), // Currency code (e.g., "EGP", "USD")
        createdAt: values_1.v.number(), // Timestamp of creation
    })
        .index("by_user", ["userId"]), // Index for fast user-specific queries
});
