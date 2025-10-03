/**
 * Transaction management functions
 * Placeholder for Story 3.2+ - will be fully implemented later
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get recent transactions for a user
 * Used by AI for context awareness
 */
export const getRecentTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Placeholder: Returns empty array until transactions table is created
    // This will be implemented in Story 3.2+
    return [];
  },
});
