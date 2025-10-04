import { httpAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Telegram Update structure (simplified for webhook handling)
 */
interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      username?: string;
      first_name: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      username?: string;
      first_name: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data?: string;
  };
}

/**
 * Internal update format for processing
 */
interface ProcessedUpdate {
  updateId: number;
  type: "message" | "callback_query" | "unknown";
  userId: number;
  chatId: number;
  timestamp: number;
  data: {
    messageId?: number;
    text?: string;
    callbackData?: string;
    username?: string;
    firstName: string;
  };
}

/**
 * Webhook validation configuration
 */
const WEBHOOK_CONFIG = {
  maxBodySize: 1024 * 1024, // 1MB max payload
  requiredHeaders: ["content-type"],
  validContentType: "application/json",
  maxUpdateAge: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Telegram Webhook HTTP Action
 * 
 * Receives Telegram updates via webhook and forwards to Trigger.dev for processing.
 * Implements fast acknowledgment (<200ms) with idempotency and validation.
 */
export const webhookHandler = httpAction(async (ctx, request) => {
  const startTime = Date.now();
  
  try {
    // 1. Basic request validation
    const validationResult = await validateRequest(request);
    if (!validationResult.isValid) {
      console.warn("[telegram:webhook] Invalid request:", validationResult.error);
      return new Response(validationResult.error, { 
        status: validationResult.status,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // 2. Parse and validate update payload
    const telegramUpdate: TelegramUpdate = validationResult.body;
    const processedUpdate = processUpdate(telegramUpdate);
    
    if (!processedUpdate) {
      console.warn("[telegram:webhook] Unsupported update type:", telegramUpdate);
      return new Response("OK", { status: 200 });
    }

    // 3. Validate update freshness (prevent replay attacks)
    const updateAge = Date.now() - (processedUpdate.timestamp * 1000);
    if (updateAge > WEBHOOK_CONFIG.maxUpdateAge) {
      console.warn("[telegram:webhook] Update too old:", {
        updateId: processedUpdate.updateId,
        age: updateAge,
      });
      return new Response("OK", { status: 200 });
    }

    // 4. Generate idempotency key and metadata
    const idempotencyKey = `telegram_${processedUpdate.updateId}`;
    const concurrencyKey = `user_${processedUpdate.userId}`;
    
    // 5. Process message directly in Convex (no external dependencies!)
    console.log("[telegram:webhook] Processing message:", {
      updateId: processedUpdate.updateId,
      userId: processedUpdate.userId,
      chatId: processedUpdate.chatId,
      type: processedUpdate.type,
    });

    // Process the message directly in Convex
    await ctx.runAction(internal.messageProcessor.processMessage, {
      update: processedUpdate,
      idempotencyKey,
    });

    // 6. Fast response to Telegram
    const duration = Date.now() - startTime;
    console.log("[telegram:webhook] Processed successfully:", {
      updateId: processedUpdate.updateId,
      duration,
    });
    return new Response("OK", { 
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Processing-Time": duration.toString(),
      }
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error("[telegram:webhook] Processing error:", {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3),
      duration,
    });

    // Always return 200 to Telegram to prevent retries for our internal errors
    return new Response("OK", { status: 200 });
  }
});

/**
 * Validate incoming HTTP request
 */
async function validateRequest(request: Request): Promise<{
  isValid: boolean;
  status: number;
  error?: string;
  body?: any;
}> {
  // Check HTTP method
  if (request.method !== "POST") {
    return {
      isValid: false,
      status: 405,
      error: "Method Not Allowed",
    };
  }

  // Check content type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes(WEBHOOK_CONFIG.validContentType)) {
    return {
      isValid: false,
      status: 400,
      error: "Invalid Content-Type",
    };
  }

  // Parse JSON body with size limit
  try {
    const text = await request.text();
    if (text.length > WEBHOOK_CONFIG.maxBodySize) {
      return {
        isValid: false,
        status: 413,
        error: "Payload Too Large",
      };
    }

    const body = JSON.parse(text);
    
    // Basic Telegram update validation
    if (!body || typeof body.update_id !== "number") {
      return {
        isValid: false,
        status: 400,
        error: "Invalid Telegram update format",
      };
    }

    return {
      isValid: true,
      status: 200,
      body,
    };

  } catch (error) {
    return {
      isValid: false,
      status: 400,
      error: "Invalid JSON",
    };
  }
}

/**
 * Convert Telegram update to internal format
 */
function processUpdate(update: TelegramUpdate): ProcessedUpdate | null {
  // Handle message updates
  if (update.message) {
    return {
      updateId: update.update_id,
      type: "message",
      userId: update.message.from.id,
      chatId: update.message.chat.id,
      timestamp: update.message.date,
      data: {
        messageId: update.message.message_id,
        text: update.message.text,
        username: update.message.from.username,
        firstName: update.message.from.first_name,
      },
    };
  }

  // Handle callback query updates
  if (update.callback_query) {
    return {
      updateId: update.update_id,
      type: "callback_query", 
      userId: update.callback_query.from.id,
      chatId: update.callback_query.message?.chat.id || 0,
      timestamp: Math.floor(Date.now() / 1000), // Current timestamp for callbacks
      data: {
        messageId: update.callback_query.message?.message_id,
        callbackData: update.callback_query.data,
        username: update.callback_query.from.username,
        firstName: update.callback_query.from.first_name,
      },
    };
  }

  // Unsupported update type
  console.warn("[telegram:webhook] Unsupported update:", {
    updateId: update.update_id,
    keys: Object.keys(update),
  });
  
  return null;
}

/**
 * Health check endpoint for webhook validation
 */
export const healthCheck = httpAction(async (ctx, request) => {
  return new Response(JSON.stringify({
    status: "ok",
    service: "telegram-webhook",
    timestamp: new Date().toISOString(),
    version: "6.2.0",
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
