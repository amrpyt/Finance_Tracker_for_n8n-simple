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
});
