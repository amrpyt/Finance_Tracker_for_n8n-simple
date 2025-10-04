"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Processed update structure from webhook
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
 * User profile structure
 */
interface UserProfile {
  userId: number;
  language: "en" | "ar";
  awaitingConfirmation?: boolean;
  pendingData?: any;
}

/**
 * AI Intent detection result
 */
interface AIIntentResult {
  intent: "expense" | "income" | "balance_check" | "list_transactions" | "chart" | "help" | "unknown";
  confidence: number;
  entities: {
    amount?: number;
    description?: string;
    category?: string;
    chartType?: "pie" | "bar" | "line";
    period?: "week" | "month" | "year";
  };
  nextAction: "execute" | "confirm" | "clarify";
}

/**
 * Main Message Processor Action
 * 
 * Processes all Telegram updates in a single Convex action.
 * Handles routing, AI integration, and business logic.
 */
export const processMessage = action({
  args: {
    update: v.object({
      updateId: v.number(),
      type: v.string(),
      userId: v.number(),
      chatId: v.number(),
      timestamp: v.number(),
      data: v.object({
        messageId: v.optional(v.number()),
        text: v.optional(v.string()),
        callbackData: v.optional(v.string()),
        username: v.optional(v.string()),
        firstName: v.string(),
      }),
    }),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, { update, idempotencyKey }) => {
    const startTime = Date.now();

    console.log(`[messageProcessor] Processing update`, {
      updateId: update.updateId,
      userId: update.userId,
      type: update.type,
      idempotencyKey,
    });

    try {
      // 1. Load user profile
      const userProfile = await loadUserProfile(ctx, update.userId);

      // 2. Route based on update type
      let result;
      if (update.type === "callback_query") {
        result = await handleCallbackQuery(ctx, update, userProfile);
      } else if (update.data.text?.startsWith("/")) {
        result = await handleCommand(ctx, update, userProfile);
      } else if (userProfile.awaitingConfirmation) {
        result = await handleConfirmationResponse(ctx, update, userProfile);
      } else {
        result = await handleNaturalLanguage(ctx, update, userProfile);
      }

      const duration = Date.now() - startTime;
      console.log(`[messageProcessor] Completed processing`, {
        updateId: update.updateId,
        userId: update.userId,
        duration,
        success: result.success,
      });

      return {
        success: true,
        updateId: update.updateId,
        duration,
        result,
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[messageProcessor] Processing failed`, {
        updateId: update.updateId,
        userId: update.userId,
        error: error.message,
        duration,
      });

      // Send error message to user
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId: update.chatId,
        text: "Sorry, there was an error processing your message. Please try again.",
      });

      return {
        success: false,
        updateId: update.updateId,
        error: error.message,
        duration,
      };
    }
  },
});

/**
 * Load user profile from database
 */
async function loadUserProfile(ctx: any, userId: number): Promise<UserProfile> {
  try {
    const profile = await ctx.runQuery(internal.userProfiles.getUserProfile, {
      userId: userId.toString(),
    });

    if (profile) {
      return {
        userId,
        language: profile.language || "en",
        awaitingConfirmation: profile.awaitingConfirmation || false,
        pendingData: profile.pendingData,
      };
    }

    // Create default profile for new users
    return {
      userId,
      language: "en",
      awaitingConfirmation: false,
    };

  } catch (error) {
    console.warn(`[messageProcessor] Failed to load user profile:`, error);
    return {
      userId,
      language: "en",
      awaitingConfirmation: false,
    };
  }
}

/**
 * Handle callback query (button press)
 */
async function handleCallbackQuery(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const callbackData = update.data.callbackData;
  
  if (!callbackData) {
    await ctx.runAction(internal.telegramAPI.answerCallbackQuery, {
      callbackQueryId: update.updateId.toString(),
      text: "Invalid button data",
    });
    return { success: false, reason: "invalid_callback_data" };
  }

  console.log(`[messageProcessor] Handling callback`, {
    userId: update.userId,
    data: callbackData,
  });

  // Always acknowledge callback first
  await ctx.runAction(internal.telegramAPI.answerCallbackQuery, {
    callbackQueryId: update.updateId.toString(),
  });

  const [action, param] = callbackData.split(":");

  switch (action) {
    case "language":
      return await handleLanguageChange(ctx, update, param as "en" | "ar");
    
    case "confirm_expense":
      return await handleExpenseConfirmation(ctx, update, param, userProfile);
    
    case "cancel":
      return await handleCancelAction(ctx, update, userProfile);
    
    case "chart":
      return await handleChartRequest(ctx, update, userProfile, param);
    
    default:
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId: update.chatId,
        text: userProfile.language === "ar" ? "إجراء غير معروف" : "Unknown action",
      });
      return { success: false, reason: "unknown_action" };
  }
}

/**
 * Handle slash commands
 */
async function handleCommand(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const command = update.data.text!.split(" ")[0];
  
  console.log(`[messageProcessor] Handling command`, {
    command,
    userId: update.userId,
    language: userProfile.language,
  });

  switch (command) {
    case "/start":
      return await handleStartCommand(ctx, update, userProfile);
    
    case "/help":
      return await handleHelpCommand(ctx, update, userProfile);
    
    case "/balance":
      return await ctx.runAction(internal.balanceActions.checkBalance, {
        userId: update.userId,
        chatId: update.chatId,
        language: userProfile.language,
      });
    
    case "/chart":
      return await handleChartCommand(ctx, update, userProfile);
    
    case "/status":
      return await handleStatusCommand(ctx, update, userProfile);
    
    default:
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId: update.chatId,
        text: userProfile.language === "ar"
          ? `أمر غير معروف: ${command}\nاكتب /help للمساعدة`
          : `Unknown command: ${command}\nType /help for assistance`,
      });
      return { success: false, reason: "unknown_command" };
  }
}

/**
 * Handle confirmation responses
 */
async function handleConfirmationResponse(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const text = update.data.text?.toLowerCase().trim();
  const isConfirmation = ["yes", "y", "ok", "confirm", "نعم", "موافق"].includes(text || "");
  const isRejection = ["no", "n", "cancel", "لا", "إلغاء"].includes(text || "");

  if (isConfirmation && userProfile.pendingData) {
    // Process the pending action
    return await processPendingAction(ctx, update, userProfile);
  }
  
  if (isRejection) {
    // Clear pending state
    await clearUserPendingState(ctx, update.userId);
    
    await ctx.runAction(internal.telegramAPI.sendMessage, {
      chatId: update.chatId,
      text: userProfile.language === "ar" ? "تم الإلغاء" : "Cancelled",
    });
    
    return { success: true, action: "cancelled" };
  }

  // Not a clear confirmation, ask again
  await ctx.runAction(internal.telegramAPI.sendMessage, {
    chatId: update.chatId,
    text: userProfile.language === "ar"
      ? "يرجى الإجابة بـ 'نعم' أو 'لا'"
      : "Please answer with 'yes' or 'no'",
  });

  return { success: false, reason: "unclear_confirmation" };
}

/**
 * Handle natural language using AI
 */
async function handleNaturalLanguage(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const text = update.data.text || "";
  
  if (text.length === 0) {
    await ctx.runAction(internal.telegramAPI.sendMessage, {
      chatId: update.chatId,
      text: userProfile.language === "ar"
        ? "لم أفهم هذا النوع من الرسائل"
        : "I don't understand this type of message",
    });
    return { success: false, reason: "empty_text" };
  }

  // Use RORK for intent detection
  const intentResult = await detectIntent(ctx, text, userProfile);
  
  // Route based on detected intent
  return await routeByIntent(ctx, update, userProfile, intentResult);
}

/**
 * Detect user intent using RORK AI
 */
async function detectIntent(ctx: any, text: string, userProfile: UserProfile): Promise<AIIntentResult> {
  try {
    const result = await ctx.runAction(internal.rorkIntegration.processText, {
      text,
      language: userProfile.language,
      context: "financial_assistant",
    });

    if (result.success) {
      return parseAIResponse(result.response, text);
    }

    // Fallback to keyword detection
    return detectIntentFallback(text);

  } catch (error) {
    console.warn(`[messageProcessor] AI intent detection failed:`, error);
    return detectIntentFallback(text);
  }
}

/**
 * Parse AI response into structured intent
 */
function parseAIResponse(response: any, originalText: string): AIIntentResult {
  // Simple intent extraction from AI response
  const content = response.content?.toLowerCase() || "";
  
  let intent: AIIntentResult["intent"] = "unknown";
  let confidence = 0.5;

  if (content.includes("expense") || content.includes("spent") || content.includes("صرف")) {
    intent = "expense";
    confidence = 0.8;
  } else if (content.includes("income") || content.includes("earn") || content.includes("راتب")) {
    intent = "income";
    confidence = 0.8;
  } else if (content.includes("balance") || content.includes("رصيد")) {
    intent = "balance_check";
    confidence = 0.9;
  } else if (content.includes("chart") || content.includes("graph") || content.includes("رسم")) {
    intent = "chart";
    confidence = 0.9;
  }

  return {
    intent,
    confidence,
    entities: {},
    nextAction: confidence > 0.7 ? "execute" : "clarify",
  };
}

/**
 * Fallback intent detection using keywords
 */
function detectIntentFallback(text: string): AIIntentResult {
  const lower = text.toLowerCase();
  
  // Expense patterns
  if (/\b(spent|paid|bought|cost|صرف|دفع|اشتر)\b/.test(lower)) {
    return {
      intent: "expense",
      confidence: 0.7,
      entities: {},
      nextAction: "execute",
    };
  }
  
  // Income patterns  
  if (/\b(earned|received|salary|income|راتب|استلم|كسب)\b/.test(lower)) {
    return {
      intent: "income",
      confidence: 0.7,
      entities: {},
      nextAction: "execute",
    };
  }
  
  // Balance patterns
  if (/\b(balance|total|how much|رصيد|كم|المجموع)\b/.test(lower)) {
    return {
      intent: "balance_check",
      confidence: 0.8,
      entities: {},
      nextAction: "execute",
    };
  }
  
  // Chart patterns
  if (/\b(chart|graph|visual|show.*chart|رسم|جراف)\b/.test(lower)) {
    return {
      intent: "chart",
      confidence: 0.8,
      entities: {},
      nextAction: "execute",
    };
  }

  return {
    intent: "unknown",
    confidence: 0.3,
    entities: {},
    nextAction: "clarify",
  };
}

/**
 * Route message based on detected intent
 */
async function routeByIntent(ctx: any, update: ProcessedUpdate, userProfile: UserProfile, intent: AIIntentResult) {
  console.log(`[messageProcessor] Routing by intent`, {
    intent: intent.intent,
    confidence: intent.confidence,
    userId: update.userId,
  });

  if (intent.nextAction === "clarify") {
    await ctx.runAction(internal.telegramAPI.sendMessage, {
      chatId: update.chatId,
      text: userProfile.language === "ar"
        ? "لم أفهم طلبك بوضوح. جرب استخدام الأوامر مثل /help"
        : "I didn't understand your request clearly. Try using commands like /help",
    });
    return { success: false, reason: "clarification_needed" };
  }

  switch (intent.intent) {
    case "expense":
      return await ctx.runAction(internal.expenseActions.addExpense, {
        userId: update.userId,
        chatId: update.chatId,
        text: update.data.text || "",
        language: userProfile.language,
      });

    case "income":
      return await ctx.runAction(internal.expenseActions.addIncome, {
        userId: update.userId,
        chatId: update.chatId,
        text: update.data.text || "",
        language: userProfile.language,
      });

    case "balance_check":
      return await ctx.runAction(internal.balanceActions.checkBalance, {
        userId: update.userId,
        chatId: update.chatId,
        language: userProfile.language,
      });

    case "chart":
      return await ctx.runAction(internal.chartGenerator.generateChart, {
        userId: update.userId,
        chatId: update.chatId,
        chartType: "pie",
        period: "month",
        language: userProfile.language,
      });

    case "help":
      return await handleHelpCommand(ctx, update, userProfile);

    default:
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId: update.chatId,
        text: userProfile.language === "ar"
          ? "لم أستطع فهم طلبك. اكتب /help للمساعدة"
          : "I couldn't understand your request. Type /help for assistance",
      });
      return { success: false, reason: "unknown_intent" };
  }
}

/**
 * Handle /start command
 */
async function handleStartCommand(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const welcomeText = userProfile.language === "ar"
    ? `مرحباً ${update.data.firstName}! 👋\n\nأنا مساعدك المالي الشخصي. يمكنني مساعدتك في:\n• تتبع المصروفات والدخل\n• التحقق من الأرصدة\n• إنشاء الرسوم البيانية\n• إدارة الحسابات`
    : `Hello ${update.data.firstName}! 👋\n\nI'm your personal finance assistant. I can help you:\n• Track expenses and income\n• Check account balances\n• Generate expense charts\n• Manage your accounts`;

  await ctx.runAction(internal.telegramAPI.sendMessage, {
    chatId: update.chatId,
    text: welcomeText,
    replyMarkup: {
      inline_keyboard: [[
        { text: "English", callback_data: "language:en" },
        { text: "العربية", callback_data: "language:ar" },
      ]],
    },
  });

  return { success: true, command: "/start" };
}

/**
 * Handle /help command
 */
async function handleHelpCommand(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const helpText = userProfile.language === "ar"
    ? `📖 المساعدة والأوامر\n\n🔹 الأوامر:\n/start - البدء\n/balance - الرصيد\n/chart - رسم بياني\n/help - المساعدة\n\n💬 يمكنك أيضاً:\n• "صرفت 50 على القهوة"\n• "كم رصيدي؟"\n• "اعرض لي رسم بياني"`
    : `📖 Help & Commands\n\n🔹 Commands:\n/start - Get started\n/balance - Check balance\n/chart - Generate chart\n/help - Show help\n\n💬 You can also:\n• "I spent 50 on coffee"\n• "What's my balance?"\n• "Show me a chart"`;

  await ctx.runAction(internal.telegramAPI.sendMessage, {
    chatId: update.chatId,
    text: helpText,
  });

  return { success: true, command: "/help" };
}

/**
 * Handle /chart command
 */
async function handleChartCommand(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  return await ctx.runAction(internal.chartGenerator.generateChart, {
    userId: update.userId,
    chatId: update.chatId,
    chartType: "pie",
    period: "month",
    language: userProfile.language,
  });
}

/**
 * Handle /status command
 */
async function handleStatusCommand(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  const statusText = userProfile.language === "ar"
    ? `📊 حالة النظام\n\n🟢 البوت: يعمل\n💾 قاعدة البيانات: متصلة\n🤖 الذكاء الاصطناعي: نشط\n\nمعرف المستخدم: ${update.userId}\nاللغة: ${userProfile.language === "ar" ? "العربية" : "الإنجليزية"}`
    : `📊 System Status\n\n🟢 Bot: Online\n💾 Database: Connected\n🤖 AI: Active\n\nUser ID: ${update.userId}\nLanguage: ${userProfile.language === "ar" ? "Arabic" : "English"}`;

  await ctx.runAction(internal.telegramAPI.sendMessage, {
    chatId: update.chatId,
    text: statusText,
  });

  return { success: true, command: "/status" };
}

/**
 * Handle language change
 */
async function handleLanguageChange(ctx: any, update: ProcessedUpdate, newLanguage: "en" | "ar") {
  await ctx.runMutation(internal.userProfiles.updateUserLanguage, {
    userId: update.userId.toString(),
    language: newLanguage,
  });

  const confirmText = newLanguage === "ar"
    ? "✅ تم تغيير اللغة إلى العربية"
    : "✅ Language changed to English";

  await ctx.runAction(internal.telegramAPI.sendMessage, {
    chatId: update.chatId,
    text: confirmText,
  });

  return { success: true, action: "language_changed", newLanguage };
}

/**
 * Handle expense confirmation
 */
async function handleExpenseConfirmation(ctx: any, update: ProcessedUpdate, param: string, userProfile: UserProfile) {
  try {
    const expenseData = JSON.parse(Buffer.from(param, 'base64').toString());
    
    return await ctx.runAction(internal.expenseActions.processConfirmedExpense, {
      expenseData,
      chatId: update.chatId,
      language: userProfile.language,
    });

  } catch (error) {
    await ctx.runAction(internal.telegramAPI.sendMessage, {
      chatId: update.chatId,
      text: userProfile.language === "ar"
        ? "خطأ في معالجة التأكيد"
        : "Error processing confirmation",
    });

    return { success: false, error: "confirmation_parse_error" };
  }
}

/**
 * Handle cancel action
 */
async function handleCancelAction(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  await clearUserPendingState(ctx, update.userId);

  await ctx.runAction(internal.telegramAPI.sendMessage, {
    chatId: update.chatId,
    text: userProfile.language === "ar" ? "❌ تم الإلغاء" : "❌ Cancelled",
  });

  return { success: true, action: "cancelled" };
}

/**
 * Handle chart request from callback
 */
async function handleChartRequest(ctx: any, update: ProcessedUpdate, userProfile: UserProfile, param: string) {
  const [chartType, period] = param.split("_");
  
  return await ctx.runAction(internal.chartGenerator.generateChart, {
    userId: update.userId,
    chatId: update.chatId,
    chartType: chartType as "pie" | "bar" | "line",
    period: period as "week" | "month" | "year",
    language: userProfile.language,
  });
}

/**
 * Process pending action
 */
async function processPendingAction(ctx: any, update: ProcessedUpdate, userProfile: UserProfile) {
  if (!userProfile.pendingData) {
    return { success: false, reason: "no_pending_data" };
  }

  const actionType = userProfile.pendingData.type;
  
  switch (actionType) {
    case "expense":
      return await ctx.runAction(internal.expenseActions.processConfirmedExpense, {
        expenseData: userProfile.pendingData.data,
        chatId: update.chatId,
        language: userProfile.language,
      });
    
    default:
      return { success: false, reason: "unknown_pending_action" };
  }
}

/**
 * Clear user pending state
 */
async function clearUserPendingState(ctx: any, userId: number) {
  await ctx.runMutation(internal.userProfiles.clearPendingAction, {
    userId: userId.toString(),
  });
}
