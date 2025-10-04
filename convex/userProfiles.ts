import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user profile (internal - called from actions)
 */
export const getUserProfile = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return profile;
  },
});

/**
 * Update user language (internal - called from actions)
 */
export const updateUserLanguage = internalMutation({
  args: {
    userId: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        language: args.language,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        language: args.language,
        awaitingConfirmation: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Set pending action for user (internal - called from actions)
 */
export const setPendingAction = internalMutation({
  args: {
    userId: v.string(),
    actionType: v.string(),
    actionData: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const pendingData = {
      type: args.actionType,
      data: args.actionData,
      timestamp: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        awaitingConfirmation: true,
        pendingData,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        language: "en",
        awaitingConfirmation: true,
        pendingData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Clear pending action (internal - called from actions)
 */
export const clearPendingAction = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        awaitingConfirmation: false,
        pendingData: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
