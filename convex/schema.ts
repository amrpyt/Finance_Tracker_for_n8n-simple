// Database schema (JavaScript version for Docker Convex compatibility)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    telegramUserId: v.string(),      // Telegram user ID (unique identifier)
    username: v.optional(v.string()), // Telegram username (may not exist)
    firstName: v.string(),            // User's first name from Telegram
    languagePreference: v.string(),   // "ar" or "en"
    createdAt: v.number(),            // Timestamp of user creation
  })
    .index("by_telegram_id", ["telegramUserId"]), // Index for fast lookups

  accounts: defineTable({
    userId: v.id("users"),            // Reference to users table
    name: v.string(),                 // Account name (e.g., "Main Bank", "Cash Wallet")
    type: v.union(
      v.literal("bank"),
      v.literal("cash"),
      v.literal("credit")
    ),                                // Account type: bank, cash, or credit
    balance: v.number(),              // Current balance
    currency: v.string(),             // Currency code (e.g., "EGP", "USD")
    createdAt: v.number(),            // Timestamp of creation
  })
    .index("by_user", ["userId"]),    // Index for fast user-specific queries
});
