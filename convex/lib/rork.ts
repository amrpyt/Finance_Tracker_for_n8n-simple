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
 * Get API key from environment variable
 */
function getApiKey(): string {
  const apiKey = process.env.RORK_API_KEY;
  if (!apiKey) {
    throw new AppError("MISSING_API_KEY", {
      en: "Rork API key is not configured. Please contact support.",
      ar: "مفتاح Rork API غير مكوّن. يرجى الاتصال بالدعم.",
    });
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

      // Make API request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          message: request.message,
          system_prompt: request.systemPrompt,
          functions: request.functions,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
        }),
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
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data.content !== "string") {
        throw new AppError("INVALID_API_RESPONSE", {
          en: "Received invalid response from AI service.",
          ar: "تم استلام استجابة غير صالحة من خدمة الذكاء الاصطناعي.",
        });
      }

      return {
        content: data.content,
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
      // Content is plain text, not JSON
      return {
        intent: "ask_clarification",
        entities: { message: response.content },
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
