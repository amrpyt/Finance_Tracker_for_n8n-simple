"use node";

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
 * Process user message with AI to extract intent and entities
 * 
 * This is the main entry point for AI-powered natural language understanding.
 * It handles the full flow: context gathering, AI call, response parsing, and logging.
 * 
 * @param userId - The user's Convex ID
 * @param message - The user's natural language message
 */
export const processUserMessage = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    
    try {
      console.log(`[AI] Processing message for user ${args.userId}`);

      // Step 1: Store user message in conversation history
      await ctx.runMutation(api.messages.addMessage, {
        userId: args.userId,
        role: "user",
        content: args.message,
      });

      // Step 2: Get recent conversation history for context
      const recentMessages = await ctx.runQuery(api.messages.getRecentMessages, {
        userId: args.userId,
        limit: 10, // Last 10 messages (5 exchanges)
      });

      // Step 3: Get user information for language preference
      const user = await ctx.runQuery(api.users.getUser, { 
        userId: args.userId 
      });

      if (!user) {
        throw new AppError("USER_NOT_FOUND", {
          en: "User not found. Please restart the bot with /start",
          ar: "لم يتم العثور على المستخدم. يرجى إعادة تشغيل البوت بـ /start",
        });
      }

      // Step 4: Get recent transactions for context
      const recentTransactions = await ctx.runQuery(
        api.transactions.getRecentTransactions,
        {
          userId: args.userId,
          limit: 3,
        }
      );

      // Step 5: Format conversation history for AI
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Step 6: Generate contextualized system prompt
      const systemPrompt = generateSystemPrompt({
        userLanguage: user.languagePreference as "ar" | "en",
        userName: user.firstName,
        recentTransactions: recentTransactions.map((tx) => ({
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
        })),
        conversationHistory,
      });

      // Step 7: Get function definitions
      const functions = getFunctionDefinitions();

      // Step 8: Call Rork API
      console.log(`[AI] Calling Rork API for user ${args.userId}`);
      console.log(`[AI] Message: "${args.message}"`);
      console.log(`[AI] System prompt length: ${systemPrompt.length} chars`);
      console.log(`[AI] Functions count: ${functions.length}`);
      console.log(`[AI] Conversation history: ${conversationHistory.length} messages`);
      
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
      console.log(`[AI] Response content length: ${rorkResponse.content?.length || 0} chars`);

      // Log slow responses
      if (apiLatency > 3000) {
        console.warn(`[AI] Slow API response: ${apiLatency}ms for user ${args.userId}`);
      }

      // Step 9: Parse AI response
      const parsedResponse = parseAIResponse(rorkResponse);

      // Step 10: Store AI response in conversation history
      await ctx.runMutation(api.messages.addMessage, {
        userId: args.userId,
        role: "assistant",
        content: rorkResponse.content,
        intent: parsedResponse.intent,
        entities: parsedResponse.entities,
      });

      // Step 11: Log structured data (anonymized)
      const totalLatency = Date.now() - startTime;
      console.log(`[AI] Processed message in ${totalLatency}ms`, {
        userId: args.userId,
        intent: parsedResponse.intent,
        confidence: parsedResponse.confidence,
        nextAction: parsedResponse.nextAction,
        apiLatency,
        totalLatency,
        historyLength: conversationHistory.length,
      });

      return parsedResponse;
    } catch (error) {
      const totalLatency = Date.now() - startTime;
      console.error(`[AI] Error processing message (${totalLatency}ms):`, {
        userId: args.userId,
        error: error instanceof AppError ? error.message : "Unknown error",
        errorCode: error instanceof AppError ? error.code : "UNKNOWN",
      });

      // Re-throw AppErrors (user-facing)
      if (error instanceof AppError) {
        throw error;
      }

      // Convert unknown errors to generic AppError
      throw new AppError("AI_PROCESSING_ERROR", {
        en: "Sorry, I'm having trouble understanding your message right now. Please try again.",
        ar: "عذراً، أواجه صعوبة في فهم رسالتك الآن. يرجى المحاولة مرة أخرى.",
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
