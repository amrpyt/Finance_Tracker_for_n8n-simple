/**
 * AI integration actions for natural language understanding
 * Main entry point for processing user messages with Rork Toolkit API
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { callRorkLLM, parseAIResponse, ParsedAIResponse } from "./lib/rork";
import { generateSystemPrompt } from "./prompts/system";
import { getFunctionDefinitions } from "./prompts/functions";
import { AppError } from "./lib/errors";
import { api } from "./_generated/api";

/**
 * Conversation history message
 */
const conversationMessageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  timestamp: v.number(),
});

/**
 * Process user message with AI to extract intent and entities
 * 
 * This is the main entry point for AI-powered natural language understanding.
 * It handles the full flow: context gathering, AI call, response parsing, and logging.
 * 
 * @param userId - The user's Convex ID
 * @param message - The user's natural language message
 * @param conversationHistory - Optional: Last 3-5 messages for context
 * @returns Parsed AI response with intent, entities, and next action
 */
export const processUserMessage = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
    conversationHistory: v.optional(v.array(conversationMessageValidator)),
  },
  handler: async (ctx, args): Promise<ParsedAIResponse> => {
    const startTime = Date.now();
    
    try {
      // Step 1: Fetch user data for context
      console.log(`[AI] Processing message for user ${args.userId}`);
      
      const user = await ctx.runQuery(api.users.getUser, {
        userId: args.userId,
      });
      
      if (!user) {
        throw new AppError("USER_NOT_FOUND", {
          en: "User not found. Please restart the bot with /start",
          ar: "المستخدم غير موجود. يرجى إعادة تشغيل البوت باستخدام /start",
        });
      }

      // Step 2: Fetch recent transactions for context (last 3)
      const recentTransactions = await ctx.runQuery(api.transactions.getRecentTransactions, {
        userId: args.userId,
        limit: 3,
      }).catch(() => []); // Gracefully handle if transactions query doesn't exist yet

      // Step 3: Build enriched system prompt
      const systemPrompt = generateSystemPrompt({
        userLanguage: user.languagePreference as "ar" | "en",
        userName: user.firstName,
        recentTransactions: recentTransactions?.map((tx: any) => ({
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
        })),
        conversationHistory: args.conversationHistory,
      });

      // Step 4: Get function definitions
      const functions = getFunctionDefinitions();

      // Step 5: Call Rork API
      console.log(`[AI] Calling Rork API for user ${args.userId}`);
      const apiStartTime = Date.now();
      
      const rorkResponse = await callRorkLLM({
        message: args.message,
        systemPrompt,
        functions,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      const apiLatency = Date.now() - apiStartTime;
      console.log(`[AI] Rork API responded in ${apiLatency}ms`);

      // Log slow responses
      if (apiLatency > 3000) {
        console.warn(`[AI] Slow API response: ${apiLatency}ms for user ${args.userId}`);
      }

      // Step 6: Parse AI response
      const parsedResponse = parseAIResponse(rorkResponse);

      // Step 7: Log structured data (anonymized)
      const totalLatency = Date.now() - startTime;
      console.log(`[AI] Processed message in ${totalLatency}ms`, {
        userId: args.userId,
        intent: parsedResponse.intent,
        confidence: parsedResponse.confidence,
        nextAction: parsedResponse.nextAction,
        apiLatency,
        totalLatency,
      });

      return parsedResponse;

    } catch (error) {
      const totalLatency = Date.now() - startTime;
      
      // Log error with context
      console.error(`[AI] Error processing message (${totalLatency}ms):`, {
        userId: args.userId,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof AppError ? error.code : "UNKNOWN",
      });

      // Re-throw AppError for user-facing messages
      if (error instanceof AppError) {
        throw error;
      }

      // Wrap unexpected errors
      throw new AppError("AI_PROCESSING_ERROR", {
        en: "Failed to process your message. Please try again or rephrase.",
        ar: "فشل في معالجة رسالتك. يرجى المحاولة مرة أخرى أو إعادة الصياغة.",
      });
    }
  },
});

/**
 * Test action for manual AI testing in Convex dashboard
 * 
 * This is a simplified version for quick testing without full user context.
 * Use this in the Convex dashboard to test AI responses.
 */
export const testAI = action({
  args: {
    message: v.string(),
    language: v.optional(v.union(v.literal("ar"), v.literal("en"))),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    try {
      // Build simple system prompt
      const systemPrompt = generateSystemPrompt({
        userLanguage: args.language ?? "en",
        userName: "Test User",
      });

      // Get function definitions
      const functions = getFunctionDefinitions();

      // Call Rork API
      console.log(`[AI Test] Testing message: "${args.message}"`);
      const apiStartTime = Date.now();
      
      const rorkResponse = await callRorkLLM({
        message: args.message,
        systemPrompt,
        functions,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      const apiLatency = Date.now() - apiStartTime;

      // Parse response
      const parsedResponse = parseAIResponse(rorkResponse);

      const totalLatency = Date.now() - startTime;
      
      return {
        success: true,
        parsed: parsedResponse,
        raw: rorkResponse,
        timing: {
          apiLatency,
          totalLatency,
        },
      };

    } catch (error) {
      const totalLatency = Date.now() - startTime;
      
      console.error(`[AI Test] Error:`, error);
      
      return {
        success: false,
        error: error instanceof AppError ? {
          code: error.code,
          message: error.userMessage,
        } : {
          code: "UNKNOWN",
          message: String(error),
        },
        timing: {
          totalLatency,
        },
      };
    }
  },
});
