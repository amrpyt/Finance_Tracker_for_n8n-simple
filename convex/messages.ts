/**
 * Message history management functions
 * Handles conversation memory for AI context
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store a message in conversation history
 */
export const addMessage = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    intent: v.optional(v.string()),
    entities: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      userId: args.userId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
      intent: args.intent,
      entities: args.entities,
    });

    // Auto-cleanup: keep only last 100 messages per user
    await cleanupOldMessages(ctx, args.userId, 100);

    return messageId;
  },
});

/**
 * Get recent messages for AI context (last N messages)
 */
export const getRecentMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()), // Default 10 messages (5 exchanges)
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_time", (q) => 
        q.eq("userId", args.userId)
      )
      .order("desc")
      .take(limit);
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  },
});

/**
 * Get conversation history for display/debugging
 */
export const getConversationHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_time", (q) => 
        q.eq("userId", args.userId)
      )
      .order("desc")
      .collect();
    
    return messages
      .slice(offset, offset + limit)
      .reverse(); // Show in chronological order
  },
});

/**
 * Clear all messages for a user (for privacy/reset)
 */
export const clearUserMessages = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_recent", (q) => 
        q.eq("userId", args.userId)
      )
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    return { deleted: messages.length };
  },
});

/**
 * Get message statistics for a user
 */
export const getMessageStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_recent", (q) => 
        q.eq("userId", args.userId)
      )
      .collect();
    
    const userMessages = messages.filter(m => m.role === "user").length;
    const assistantMessages = messages.filter(m => m.role === "assistant").length;
    const oldestMessage = messages[messages.length - 1];
    const newestMessage = messages[0];
    
    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      oldestTimestamp: oldestMessage?.timestamp,
      newestTimestamp: newestMessage?.timestamp,
    };
  },
});

/**
 * Internal helper: cleanup old messages to prevent unbounded growth
 */
async function cleanupOldMessages(
  ctx: any,
  userId: string,
  keepCount: number = 100
): Promise<void> {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_user_time", (q) => 
      q.eq("userId", userId)
    )
    .order("desc")
    .collect();
  
  if (messages.length > keepCount) {
    const toDelete = messages.slice(keepCount);
    console.log(`Cleaning up ${toDelete.length} old messages for user ${userId}`);
    
    for (const message of toDelete) {
      await ctx.db.delete(message._id);
    }
  }
}
