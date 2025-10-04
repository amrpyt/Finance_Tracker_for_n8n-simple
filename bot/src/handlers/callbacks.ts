/**
 * Callback query handlers for inline keyboard interactions
 * Handles transaction confirmations and cancellations
 */

import TelegramBot from "node-telegram-bot-api";
import { convexClient } from "../config/convex";
import logger from "../utils/logger";
import { detectUserLanguage } from "../utils/errors";
import { sessionManager } from "../services/session";
import { api } from "../../../convex/_generated/api";

/**
 * Handle transaction confirmation callback
 */
async function handleConfirmTransaction(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userId: string,
  transactionType: "expense" | "income"
): Promise<void> {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  // Detect language from callback query
  const language = query.from.language_code === "ar" ? "ar" : "en";

  try {
    // Get pending transaction from session
    const pendingTransaction = sessionManager.getPendingTransaction(userId);

    if (!pendingTransaction) {
      const errorMsg =
        language === "ar"
          ? "⏰ انتهت صلاحية هذه المعاملة. يرجى المحاولة مرة أخرى."
          : "⏰ This transaction has expired. Please try again.";

      await bot.answerCallbackQuery(query.id, { text: errorMsg });
      await bot.editMessageText(errorMsg, {
        chat_id: chatId,
        message_id: query.message?.message_id,
      });
      return;
    }

    // Verify transaction type matches
    if (pendingTransaction.type !== transactionType) {
      const errorMsg =
        language === "ar"
          ? "❌ خطأ: نوع المعاملة غير متطابق"
          : "❌ Error: Transaction type mismatch";

      await bot.answerCallbackQuery(query.id, { text: errorMsg });
      return;
    }

    // Get user's Convex ID
    const userResult = await convexClient.query(api.users.getUserByTelegramId, {
      telegramUserId: userId,
    });

    if (!userResult) {
      throw new Error("User not found");
    }

    // Create transaction in Convex
    const result = await convexClient.mutation(api.transactions.createTransaction, {
      userId: userResult._id,
      accountId: pendingTransaction.accountId as any, // Type assertion for Convex ID
      type: pendingTransaction.type,
      amount: pendingTransaction.amount,
      description: pendingTransaction.description,
      category: pendingTransaction.category,
      date: pendingTransaction.date,
    });

    if (!result) {
      throw new Error("Failed to create transaction");
    }

    // Clear session
    sessionManager.clearPendingTransaction(userId);

    // Format success message
    const emoji = transactionType === "expense" ? "💸" : "💰";
    const typeLabel = transactionType === "expense" 
      ? (language === "ar" ? "مصروف" : "Expense")
      : (language === "ar" ? "دخل" : "Income");

    const successMsg =
      language === "ar"
        ? `✅ *تم التسجيل!*\n\n` +
          `${emoji} ${typeLabel}: ${pendingTransaction.amount} ${pendingTransaction.currency}\n` +
          `الوصف: ${pendingTransaction.description}\n` +
          `الرصيد الجديد: ${result.newBalance} ${pendingTransaction.currency}`
        : `✅ *Logged!*\n\n` +
          `${emoji} ${typeLabel}: ${pendingTransaction.amount} ${pendingTransaction.currency}\n` +
          `Description: ${pendingTransaction.description}\n` +
          `New balance: ${result.newBalance} ${pendingTransaction.currency}`;

    // Answer callback query
    await bot.answerCallbackQuery(query.id, {
      text: language === "ar" ? "✅ تم التسجيل" : "✅ Logged",
    });

    // Edit message to show success
    await bot.editMessageText(successMsg, {
      chat_id: chatId,
      message_id: query.message?.message_id,
      parse_mode: "Markdown",
    });

    logger.info("Transaction confirmed and created", {
      userId,
      transactionId: result.transactionId,
      type: transactionType,
      amount: pendingTransaction.amount,
      newBalance: result.newBalance,
    });
  } catch (error) {
    logger.error("Error confirming transaction", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      transactionType,
    });

    const errorMsg =
      language === "ar"
        ? "❌ عذراً، حدث خطأ أثناء تسجيل المعاملة. يرجى المحاولة مرة أخرى."
        : "❌ Sorry, there was an error logging the transaction. Please try again.";

    await bot.answerCallbackQuery(query.id, { text: errorMsg });

    await bot.editMessageText(errorMsg, {
      chat_id: chatId,
      message_id: query.message?.message_id,
    });

    // Clear session on error
    sessionManager.clearPendingTransaction(userId);
  }
}

/**
 * Handle transaction cancellation callback
 */
async function handleCancelTransaction(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery,
  userId: string,
  transactionType: "expense" | "income"
): Promise<void> {
  const chatId = query.message?.chat.id;
  if (!chatId) return;

  const language = query.from.language_code === "ar" ? "ar" : "en";

  try {
    // Clear pending transaction
    sessionManager.clearPendingTransaction(userId);

    const cancelMsg =
      language === "ar"
        ? "❌ تم إلغاء المعاملة"
        : "❌ Transaction cancelled";

    // Answer callback query
    await bot.answerCallbackQuery(query.id, { text: cancelMsg });

    // Edit message to show cancellation
    await bot.editMessageText(cancelMsg, {
      chat_id: chatId,
      message_id: query.message?.message_id,
    });

    logger.info("Transaction cancelled", {
      userId,
      transactionType,
    });
  } catch (error) {
    logger.error("Error cancelling transaction", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      transactionType,
    });

    await bot.answerCallbackQuery(query.id, {
      text: language === "ar" ? "حدث خطأ" : "An error occurred",
    });
  }
}

/**
 * Main callback query handler
 */
export async function handleCallbackQuery(
  bot: TelegramBot,
  query: TelegramBot.CallbackQuery
): Promise<void> {
  if (!query.data || !query.from) {
    return;
  }

  const userId = query.from.id.toString();
  const [action, targetUserId] = query.data.split(":");

  // Verify the callback is for the correct user
  if (targetUserId !== userId) {
    await bot.answerCallbackQuery(query.id, {
      text: "This action is not for you",
    });
    return;
  }

  try {
    switch (action) {
      case "confirm_expense":
        await handleConfirmTransaction(bot, query, userId, "expense");
        break;

      case "cancel_expense":
        await handleCancelTransaction(bot, query, userId, "expense");
        break;

      case "confirm_income":
        await handleConfirmTransaction(bot, query, userId, "income");
        break;

      case "cancel_income":
        await handleCancelTransaction(bot, query, userId, "income");
        break;

      default:
        logger.warn("Unknown callback action", { action, userId });
        await bot.answerCallbackQuery(query.id, {
          text: "Unknown action",
        });
    }
  } catch (error) {
    logger.error("Error handling callback query", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      action,
    });
  }
}

/**
 * Register callback query handlers with the bot
 */
export function registerCallbackHandlers(bot: TelegramBot): void {
  bot.on("callback_query", async (query: TelegramBot.CallbackQuery) => {
    await handleCallbackQuery(bot, query);
  });

  logger.info("Callback handlers registered");
}
