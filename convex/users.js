"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByTelegramId = exports.createOrGetUser = void 0;
// User management Convex functions
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
/**
 * Creates a new user or returns existing user profile.
 *
 * @param telegramUserId - Telegram user ID (unique identifier)
 * @param username - Optional Telegram username
 * @param firstName - User's first name from Telegram
 * @param languageCode - Optional language code from Telegram user object
 *
 * @returns Object with user profile and isNewUser flag
 * @throws Error if required fields are missing or invalid
 */
exports.createOrGetUser = (0, server_1.mutation)({
    args: {
        telegramUserId: values_1.v.string(),
        username: values_1.v.optional(values_1.v.string()),
        firstName: values_1.v.string(),
        languageCode: values_1.v.optional(values_1.v.string()),
    },
    handler: async (ctx, args) => {
        // Validate telegramUserId
        if (!args.telegramUserId || args.telegramUserId.trim().length === 0) {
            throw new Error(JSON.stringify({
                code: "INVALID_TELEGRAM_ID",
                en: "Telegram user ID is required",
                ar: "معرف مستخدم تيليجرام مطلوب",
            }));
        }
        // Validate firstName
        if (!args.firstName || args.firstName.trim().length === 0) {
            throw new Error(JSON.stringify({
                code: "INVALID_FIRST_NAME",
                en: "First name is required",
                ar: "الاسم الأول مطلوب",
            }));
        }
        if (args.firstName.length > 100) {
            throw new Error(JSON.stringify({
                code: "FIRST_NAME_TOO_LONG",
                en: "First name must be 100 characters or less",
                ar: "يجب أن يكون الاسم الأول 100 حرف أو أقل",
            }));
        }
        // Sanitize firstName
        const sanitizedFirstName = args.firstName.trim().slice(0, 100);
        // Check if user exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_telegram_id", (q) => q.eq("telegramUserId", args.telegramUserId))
            .unique();
        if (existing) {
            console.log("Existing user found", {
                userId: existing._id,
                telegramUserId: args.telegramUserId,
                timestamp: Date.now(),
            });
            return { user: existing, isNewUser: false };
        }
        // Determine language preference
        // Default to Arabic, set to English only if explicitly "en"
        const languagePreference = args.languageCode === "en" ? "en" : "ar";
        // Create new user
        const userId = await ctx.db.insert("users", {
            telegramUserId: args.telegramUserId,
            username: args.username,
            firstName: sanitizedFirstName,
            languagePreference,
            createdAt: Date.now(),
        });
        const user = await ctx.db.get(userId);
        // Log user creation event (will appear in Convex dashboard)
        console.log("New user created", {
            userId: user._id,
            telegramUserId: args.telegramUserId,
            firstName: sanitizedFirstName,
            languagePreference,
            timestamp: Date.now(),
        });
        return { user, isNewUser: true };
    },
});
/**
 * Get user by Telegram user ID.
 *
 * @param telegramUserId - Telegram user ID
 * @returns User profile or null if not found
 */
exports.getUserByTelegramId = (0, server_1.query)({
    args: {
        telegramUserId: values_1.v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_telegram_id", (q) => q.eq("telegramUserId", args.telegramUserId))
            .unique();
        return user;
    },
});
