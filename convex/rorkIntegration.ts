"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * RORK API configuration
 */
const RORK_CONFIG = {
  baseUrl: "https://toolkit.rork.com",
  endpoint: "/text/llm/",
  timeout: 30000,
} as const;

/**
 * Process text using RORK AI (internal - called from other actions)
 */
export const processText = internalAction({
  args: {
    text: v.string(),
    language: v.string(),
    context: v.string(),
  },
  handler: async (ctx, { text, language, context }) => {
    console.log(`[rorkIntegration] Processing text with RORK`, {
      textLength: text.length,
      language,
      context,
    });

    try {
      const systemPrompt = buildSystemPrompt(language, context);
      const url = `${RORK_CONFIG.baseUrl}${RORK_CONFIG.endpoint}`;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RORK_CONFIG.timeout);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error("Rate limited by RORK API");
        }

        if (response.status >= 500) {
          throw new Error(`RORK API server error: ${response.status}`);
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`RORK API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.completion || data.content || data.message || data.response || "";

        console.log(`[rorkIntegration] RORK processing successful`, {
          responseLength: content.length,
        });

        return {
          success: true,
          response: {
            content,
            usage: data.usage,
          },
        };

      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === "AbortError") {
          throw new Error(`RORK API timeout after ${RORK_CONFIG.timeout}ms`);
        }
        
        throw error;
      }

    } catch (error: any) {
      console.error(`[rorkIntegration] RORK processing failed:`, error);
      
      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Process user message with function calling (internal - called from other actions)
 */
export const processUserMessage = internalAction({
  args: {
    text: v.string(),
    language: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { text, language, userId }) => {
    console.log(`[rorkIntegration] Processing user message with function calling`, {
      textLength: text.length,
      language,
      userId,
    });

    try {
      // Import function definitions
      const { getFunctionDefinitions } = await import("./prompts/functions");
      const { generateSystemPrompt } = await import("./prompts/system");
      
      // Get user context for personalized prompt
      const userContext = {
        userLanguage: language as "ar" | "en",
        userName: "User", // Could be enhanced to get actual name
      };
      
      const systemPrompt = generateSystemPrompt(userContext);
      const functions = getFunctionDefinitions();
      
      const url = `${RORK_CONFIG.baseUrl}${RORK_CONFIG.endpoint}`;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        functions: functions,
        function_call: "auto",
        temperature: 0.3,
        max_tokens: 1000,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RORK_CONFIG.timeout);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new Error("Rate limited by RORK API");
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`RORK API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Parse function call response
        const functionCall = data.function_call;
        if (functionCall) {
          const functionName = functionCall.name;
          const functionArgs = JSON.parse(functionCall.arguments || "{}");
          
          return {
            success: true,
            intent: functionName,
            entities: functionArgs,
            confidence: functionArgs.confidence || 0.8,
            reasoning: functionArgs.reasoning || "",
            needsClarification: functionArgs.clarification_needed || false,
          };
        } else {
          // Fallback to content parsing
          const content = data.completion || data.content || data.message || "";
          return {
            success: true,
            intent: "unknown",
            entities: {},
            confidence: 0.3,
            reasoning: "No function call detected",
            content,
          };
        }

      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === "AbortError") {
          throw new Error(`RORK API timeout after ${RORK_CONFIG.timeout}ms`);
        }
        
        throw error;
      }

    } catch (error: any) {
      console.error(`[rorkIntegration] Function calling failed:`, error);
      
      return {
        success: false,
        error: error.message,
        intent: "unknown",
        entities: {},
        confidence: 0,
      };
    }
  },
});

/**
 * Build system prompt for RORK based on language and context
 */
function buildSystemPrompt(language: string, context: string): string {
  const prompts = {
    en: {
      financial_assistant: `You are a financial assistant bot. Analyze user messages and extract financial intents.

Available intents:
- expense: User spent money (keywords: spent, bought, paid, cost)
- income: User earned money (keywords: earned, received, got paid, salary)
- balance_check: User wants to see balance (keywords: balance, how much, total)
- chart: User wants to see charts (keywords: chart, graph, show chart, visual)
- help: User needs help (keywords: help, what can you do)
- unknown: Cannot determine intent

Extract:
- amount: numerical value if present
- description: what the money was for
- category: Food, Transportation, Shopping, Bills, Entertainment, Healthcare, Education, Other

Respond with confidence score 0-1. Focus on detecting the primary intent.`,
    },
    ar: {
      financial_assistant: `أنت مساعد مالي ذكي. حلل رسائل المستخدم واستخرج النوايا المالية.

النوايا المتاحة:
- expense: المستخدم صرف أموال (كلمات مفتاحية: صرفت، اشتريت، دفعت، كلف)
- income: المستخدم كسب أموال (كلمات مفتاحية: كسبت، استلمت، راتب)
- balance_check: المستخدم يريد رؤية الرصيد (كلمات مفتاحية: رصيد، كم، المجموع)
- chart: المستخدم يريد رؤية الرسوم البيانية (كلمات مفتاحية: رسم، جراف، اظهر رسم)
- help: المستخدم يحتاج مساعدة (كلمات مفتاحية: مساعدة، ماذا تستطيع)
- unknown: لا يمكن تحديد النية

استخرج:
- amount: القيمة الرقمية إن وجدت
- description: على ماذا صرفت الأموال
- category: طعام، مواصلات، تسوق، فواتير، ترفيه، صحة، تعليم، أخرى

اجب بدرجة ثقة من 0-1. ركز على اكتشاف النية الأساسية.`,
    },
  };

  const languagePrompts = prompts[language as keyof typeof prompts] || prompts.en;
  return languagePrompts[context as keyof typeof languagePrompts] || languagePrompts.financial_assistant;
}
