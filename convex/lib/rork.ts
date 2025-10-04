"use node";

/**
 * Rork Toolkit API client with retry logic and error handling
 * Handles natural language understanding for the finance bot
 */

import { AppError } from "./errors";

/**
 * Rork API request payload
 */
export interface RorkRequest {
  message: string;
  systemPrompt: string;
  functions?: RorkFunction[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * Function definition for structured AI responses
 */
export interface RorkFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Rork API response structure
 */
export interface RorkResponse {
  content: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Parsed AI response with structured data
 */
export interface ParsedAIResponse {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  reasoning?: string;
  clarificationNeeded: boolean;
  nextAction: "execute" | "confirm" | "clarify";
}

/**
 * Configuration loaded from config.api.json
 */
interface RorkConfig {
  baseUrl: string;
  endpoint: string;
  maxRetries: number;
  backoffMs: number;
  timeoutMs: number;
}

/**
 * Load Rork configuration from environment and config file
 */
function getRorkConfig(): RorkConfig {
  // In Convex, we can't directly read config.api.json
  // Configuration should be passed or hardcoded based on the file
  return {
    baseUrl: "https://toolkit.rork.com",
    endpoint: "/text/llm/",
    maxRetries: 3,
    backoffMs: 1000,
    timeoutMs: 5000,
  };
}

/**
 * Get API key from environment variable (optional for RORK public endpoint)
 */
function getApiKey(): string | null {
  const apiKey = process.env.RORK_API_KEY;
  // Allow public access if API key is placeholder or missing
  if (!apiKey || apiKey === "your-api-key-here") {
    console.log("[Rork] Using public endpoint (no API key)");
    return null;
  }
  return apiKey;
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Rork LLM API with retry logic and error handling
 * 
 * @param request - The request payload
 * @returns Parsed AI response
 * @throws AppError on API failures after retries
 */
export async function callRorkLLM(
  request: RorkRequest
): Promise<RorkResponse> {
  const config = getRorkConfig();
  const apiKey = getApiKey();
  const url = `${config.baseUrl}${config.endpoint}`;

  let lastError: Error | null = null;
  
  // Retry loop with exponential backoff
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      // Build headers with optional authorization
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

        // Make API request with correct format (messages array) and proper function calling
        const requestBody = {
          messages: [
            {
              role: "system",
              content: request.systemPrompt,
            },
            {
              role: "user",
              content: request.message,
            }
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
        };

        // Add function calling if functions are provided
        if (request.functions && request.functions.length > 0) {
          console.log("[Rork] Sending with function calling enabled");
          (requestBody as any).functions = request.functions;
          (requestBody as any).function_call = "auto"; // Let AI decide when to call functions
        }

        console.log("[Rork] Request body:", JSON.stringify(requestBody, null, 2).substring(0, 1000));

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

      clearTimeout(timeoutId);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : config.backoffMs * Math.pow(2, attempt);
        
        console.warn(`Rate limited by Rork API. Retrying after ${waitMs}ms (attempt ${attempt + 1}/${config.maxRetries})`);
        
        if (attempt < config.maxRetries) {
          await sleep(waitMs);
          continue;
        }
        
        throw new AppError("RATE_LIMIT_EXCEEDED", {
          en: "Too many requests. Please try again in a moment.",
          ar: "طلبات كثيرة جداً. يرجى المحاولة مرة أخرى بعد قليل.",
        });
      }

      // Handle server errors (5xx) with retry
      if (response.status >= 500) {
        console.warn(`Rork API server error: ${response.status}. Retrying... (attempt ${attempt + 1}/${config.maxRetries})`);
        
        if (attempt < config.maxRetries) {
          await sleep(config.backoffMs * Math.pow(2, attempt));
          continue;
        }
        
        throw new AppError("API_SERVER_ERROR", {
          en: "AI service is temporarily unavailable. Please try again later.",
          ar: "خدمة الذكاء الاصطناعي غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.",
        });
      }

      // Handle client errors (4xx) - no retry
      if (response.status >= 400) {
        const errorText = await response.text();
        console.error(`Rork API client error: ${response.status} - ${errorText}`);
        
        throw new AppError("API_CLIENT_ERROR", {
          en: "Failed to process your request. Please try rephrasing your message.",
          ar: "فشل في معالجة طلبك. يرجى إعادة صياغة رسالتك.",
        });
      }

      // Parse successful response
      const data: any = await response.json();
            // Log the response for debugging
        console.log("[Rork] API Response:", JSON.stringify(data).substring(0, 500));
        
        // Check for function call in response
        if (data.function_call) {
          console.log("[Rork] Function call detected:", JSON.stringify(data.function_call));
        } else {
          console.log("[Rork] No function call in response, using text mode");
        }

        // Handle successful response
        if (!data || typeof data !== "object") {
          throw new AppError("INVALID_RESPONSE", {
            en: "Invalid response from AI service",
            ar: "استجابة غير صالحة من خدمة الذكاء الاصطناعي",
          });
        }

        // Extract content from various possible response formats
        const content = data.completion || data.content || data.message || data.response;

        // Validate that we have some content
        if (!content && !data.function_call) {
          throw new AppError("INVALID_RESPONSE", {
            en: "Invalid response from AI service - no content or function call",
            ar: "استجابة غير صالحة من خدمة الذكاء الاصطناعي - لا يوجد محتوى أو استدعاء دالة",
          });
        }

        return {
          content: content || "",
          functionCall: data.function_call ? {
            name: data.function_call.name,
            arguments: data.function_call.arguments,
          } : undefined,
          usage: data.usage,
        };

    } catch (error: any) {
      lastError = error;

      // Don't retry on AppError (user-facing errors)
      if (error instanceof AppError) {
        throw error;
      }

      // Handle timeout
      if (error.name === "AbortError") {
        console.warn(`Rork API timeout after ${config.timeoutMs}ms (attempt ${attempt + 1}/${config.maxRetries})`);
        
        if (attempt < config.maxRetries) {
          await sleep(config.backoffMs * Math.pow(2, attempt));
          continue;
        }
        
        throw new AppError("API_TIMEOUT", {
          en: "AI service is taking too long to respond. Please try again.",
          ar: "خدمة الذكاء الاصطناعي تستغرق وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى.",
        });
      }

      // Handle network errors
      if (error.message?.includes("fetch")) {
        console.warn(`Network error calling Rork API (attempt ${attempt + 1}/${config.maxRetries}):`, error);
        
        if (attempt < config.maxRetries) {
          await sleep(config.backoffMs * Math.pow(2, attempt));
          continue;
        }
        
        throw new AppError("NETWORK_ERROR", {
          en: "Unable to connect to AI service. Please check your connection.",
          ar: "غير قادر على الاتصال بخدمة الذكاء الاصطناعي. يرجى التحقق من اتصالك.",
        });
      }

      // Unknown error - retry if attempts remain
      console.error(`Unexpected error calling Rork API (attempt ${attempt + 1}/${config.maxRetries}):`, error);
      
      if (attempt < config.maxRetries) {
        await sleep(config.backoffMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  // All retries exhausted
  console.error("All Rork API retry attempts exhausted. Last error:", lastError);
  throw new AppError("API_RETRY_EXHAUSTED", {
    en: "AI service is currently unavailable. Please try again later.",
    ar: "خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً.",
  });
}

/**
 * Parse AI response to extract structured data
 * 
 * @param response - Raw Rork API response
 * @returns Parsed response with intent, entities, and confidence
 */
export function parseAIResponse(response: RorkResponse): ParsedAIResponse {
  try {
    // If function call is present, parse it
    if (response.functionCall) {
      const args = JSON.parse(response.functionCall.arguments);
      
      return {
        intent: response.functionCall.name,
        entities: args,
        confidence: args.confidence ?? 0.85,
        reasoning: args.reasoning,
        clarificationNeeded: args.clarification_needed ?? false,
        nextAction: determineNextAction(args.confidence ?? 0.85, args.clarification_needed ?? false),
      };
    }

    // Fallback: parse content as JSON if possible
    try {
      const parsed = JSON.parse(response.content);
      return {
        intent: parsed.intent ?? "unknown",
        entities: parsed.entities ?? {},
        confidence: parsed.confidence ?? 0.5,
        reasoning: parsed.reasoning,
        clarificationNeeded: parsed.clarification_needed ?? true,
        nextAction: determineNextAction(parsed.confidence ?? 0.5, parsed.clarification_needed ?? true),
      };
    } catch {
      // Content is plain text - try to extract transaction info
      const extracted = extractTransactionFromText(response.content);
      
      if (extracted) {
        return {
          intent: extracted.type === "expense" ? "log_expense" : "log_income",
          entities: {
            amount: extracted.amount,
            description: extracted.description,
            category: extracted.category,
            confidence: 0.8,
          },
          confidence: 0.8,
          clarificationNeeded: false,
          nextAction: "confirm",
        };
      }
      
      // No transaction info found - ask for clarification
      return {
        intent: "ask_clarification",
        entities: { question: response.content },
        confidence: 0.3,
        clarificationNeeded: true,
        nextAction: "clarify",
      };
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new AppError("PARSE_ERROR", {
      en: "Failed to understand AI response. Please try again.",
      ar: "فشل في فهم استجابة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
    });
  }
}

/**
 * Extract transaction details from AI text response
 * The AI already extracted the info - we just need to parse its structured output
 */
function extractTransactionFromText(text: string): {
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
} | null {
  console.log("[Rork] Extracting from text:", text.substring(0, 200));
  
  // Try multiple patterns for amount extraction
  let amountMatch = text.match(/\*\*\$?(\d+(?:\.\d{1,2})?)\s*(?:EGP|USD|pounds?|جنيه)?\*\*/i);
  if (!amountMatch) {
    // Try without asterisks: "50 EGP"
    amountMatch = text.match(/(\d+(?:\.\d{1,2})?)\s*(?:EGP|USD|pounds?|جنيه)/i);
  }
  if (!amountMatch) {
    console.log("[Rork] No amount found in text");
    return null;
  }
  
  const amount = parseFloat(amountMatch[1]);
  console.log("[Rork] Extracted amount:", amount);
  
  // Detect type from AI's words (multiple languages)
  const isExpense = /spent|paid|expense|bought|purchase|اشتريت|دفعت|صرفت|💸/i.test(text);
  const isIncome = /earned|received|income|salary|💰/i.test(text);
  const type = isIncome ? "income" : "expense";
  console.log("[Rork] Detected type:", type);
  
  // Extract description - look for common patterns
  let description = "Transaction";
  
  // Pattern 1: "on **coffee**" or "for **coffee**"
  const descMatch1 = text.match(/(?:on|for)\s+\*\*([^*]+)\*\*/i);
  if (descMatch1) {
    description = descMatch1[1].trim();
  } else {
    // Pattern 2: Find item after spent/bought
    const descMatch2 = text.match(/(?:spent|bought|اشتريت).*?(?:on|for|)\s*\*\*([^*]+)\*\*/i);
    if (descMatch2) {
      description = descMatch2[1].trim();
    } else {
      // Pattern 3: Just get any **word** that looks like an item
      const allMatches = text.match(/\*\*([^*\d][^*]*)\*\*/g);
      if (allMatches) {
        // Find the one that's not a number or currency
        for (const match of allMatches) {
          const content = match.replace(/\*\*/g, '').trim();
          if (!/^\d|EGP|USD|pounds|جنيه/i.test(content)) {
            description = content;
            break;
          }
        }
      }
    }
  }
  console.log("[Rork] Extracted description:", description);
  
  // Extract category from AI text
  let category = "Other";
  
  // Look for category indicators
  const categoryPatterns = {
    "Food": /food|coffee|restaurant|cafe|قهو|طعام|أكل|🍔|☕/i,
    "Transportation": /transport|uber|taxi|bus|مواصلات|🚗|🚌/i,
    "Shopping": /shopping|store|mall|تسوق|🛍️/i,
    "Bills": /bills?|electricity|water|فواتير|💡/i,
    "Entertainment": /entertainment|movie|game|ترفيه|🎬|🎮/i,
    "Healthcare": /health|doctor|medicine|صحة|طبيب|💊/i,
    "Education": /education|school|course|تعليم|📚/i,
  };
  
  for (const [cat, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(text)) {
      category = cat;
      break;
    }
  }
  
  console.log("[Rork] Extracted category:", category);
  
  return {
    type,
    amount,
    description,
    category,
  };
}

/**
 * Determine next action based on confidence and clarification flag
 */
function determineNextAction(
  confidence: number,
  clarificationNeeded: boolean
): "execute" | "confirm" | "clarify" {
  if (clarificationNeeded || confidence < 0.7) {
    return "clarify";
  }
  if (confidence < 0.85) {
    return "confirm";
  }
  return "execute";
}
