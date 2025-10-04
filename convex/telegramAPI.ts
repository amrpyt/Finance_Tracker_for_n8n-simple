"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Telegram Bot API configuration
 */
const TELEGRAM_CONFIG = {
  baseUrl: "https://api.telegram.org/bot",
  timeout: 10000,
} as const;

/**
 * Send Message Action (internal - called from other actions)
 */
export const sendMessage = internalAction({
  args: {
    chatId: v.number(),
    text: v.string(),
    replyMarkup: v.optional(v.any()),
    parseMode: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, text, replyMarkup, parseMode }) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const url = `${TELEGRAM_CONFIG.baseUrl}${botToken}/sendMessage`;
    
    const requestBody = {
      chat_id: chatId,
      text: text.substring(0, 4096), // Telegram limit
      parse_mode: parseMode,
      reply_markup: replyMarkup,
    };

    console.log(`[telegramAPI] Sending message to chat ${chatId}`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[telegramAPI] Send message failed:`, {
          status: response.status,
          error: errorData,
          chatId,
        });
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.result?.message_id,
      };

    } catch (error: any) {
      console.error(`[telegramAPI] Send message error:`, error);
      throw error;
    }
  },
});

/**
 * Answer Callback Query Action (internal - called from other actions)
 */
export const answerCallbackQuery = internalAction({
  args: {
    callbackQueryId: v.string(),
    text: v.optional(v.string()),
    showAlert: v.optional(v.boolean()),
  },
  handler: async (ctx, { callbackQueryId, text, showAlert }) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const url = `${TELEGRAM_CONFIG.baseUrl}${botToken}/answerCallbackQuery`;
    
    const requestBody = {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return { success: true };

    } catch (error: any) {
      console.error(`[telegramAPI] Answer callback error:`, error);
      throw error;
    }
  },
});

/**
 * Send Photo Action (for charts) (internal - called from other actions)
 */
export const sendPhoto = internalAction({
  args: {
    chatId: v.number(),
    photoUrl: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, photoUrl, caption }) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const url = `${TELEGRAM_CONFIG.baseUrl}${botToken}/sendPhoto`;
    
    const requestBody = {
      chat_id: chatId,
      photo: photoUrl,
      caption,
    };

    console.log(`[telegramAPI] Sending photo to chat ${chatId}`);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[telegramAPI] Send photo failed:`, {
          status: response.status,
          error: errorData,
        });
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.result?.message_id,
      };

    } catch (error: any) {
      console.error(`[telegramAPI] Send photo error:`, error);
      throw error;
    }
  },
});
