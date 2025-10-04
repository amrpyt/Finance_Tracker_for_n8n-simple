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
    isDefault: v.optional(v.boolean()), // Whether this is the default account for transactions (optional for backward compatibility)
    createdAt: v.number(),            // Timestamp of creation
  })
    .index("by_user", ["userId"])     // Index for fast user-specific queries
    .index("by_user_default", ["userId", "isDefault"]), // Index for fast default account lookup

  transactions: defineTable({
    userId: v.id("users"),            // Reference to users table
    accountId: v.id("accounts"),      // Reference to accounts table
    type: v.union(
      v.literal("expense"),
      v.literal("income")
    ),                                // Transaction type
    amount: v.number(),               // Transaction amount (positive number)
    description: v.string(),          // User-provided description
    category: v.string(),             // AI-inferred or user-specified category
    date: v.number(),                 // Transaction date (timestamp)
    isDeleted: v.boolean(),           // Soft delete flag for audit trail
    createdAt: v.number(),            // Record creation timestamp
    updatedAt: v.optional(v.number()), // Last update timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_not_deleted", ["userId", "isDeleted"])
    .index("by_account", ["accountId"])
    .index("by_user_date", ["userId", "date"]),

  messages: defineTable({
    userId: v.id("users"),            // Reference to users table
    role: v.union(
      v.literal("user"),
      v.literal("assistant")
    ),                                // Message role: user or AI assistant
    content: v.string(),              // Message content
    timestamp: v.number(),            // Message timestamp
    intent: v.optional(v.string()),   // AI-detected intent (optional)
    entities: v.optional(v.any()),    // Extracted entities (optional)
  })
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_user_recent", ["userId"]),
});
