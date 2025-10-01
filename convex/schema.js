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
});
