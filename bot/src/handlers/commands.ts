import TelegramBot from "node-telegram-bot-api";
import { convexClient, getMaskedConvexUrl } from "../config/convex";
import logger from "../utils/logger";
import { handleConvexError, detectUserLanguage } from "../utils/errors";
import { getWelcomeMessage, getHelpMessage } from "../utils/messages";
import { api } from "../../convex/_generated/api";

/**
 * Handle /start command.
 * Creates or retrieves user profile and sends personalized welcome message.
 */
export async function handleStartCommand(
  bot: TelegramBot,
  msg: TelegramBot.Message
): Promise<void> {
  try {
    const telegramUser = msg.from!;

    // Log incoming command
    logger.info("Command received", {
      command: "/start",
      userId: telegramUser.id,
      username: telegramUser.username,
      chatId: msg.chat.id,
      timestamp: Date.now(),
    });

    // Create or get user profile
    const result = await convexClient.mutation(api.users.createOrGetUser, {
      telegramUserId: telegramUser.id.toString(),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      languageCode: telegramUser.language_code,
    });

    // Get personalized welcome message based on user's language preference
    const welcomeMessage = getWelcomeMessage(
      result.user.firstName,
      result.isNewUser,
      result.user.languagePreference
    );

    // Send welcome message with Markdown formatting
    await bot.sendMessage(msg.chat.id, welcomeMessage, {
      parse_mode: "Markdown",
    });

    logger.info("User registration completed", {
      userId: telegramUser.id,
      chatId: msg.chat.id,
      isNewUser: result.isNewUser,
      languagePreference: result.user.languagePreference,
    });
  } catch (error) {
    logger.error("Error handling /start command", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: msg.from?.id,
      chatId: msg.chat.id,
    });

    // Detect user language
    const language = detectUserLanguage(
      msg.text,
      msg.from?.language_code
    );

    // Send user-friendly error message
    const errorMessage =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء إعداد ملفك الشخصي. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error setting up your profile. Please try again.";

    try {
      await bot.sendMessage(msg.chat.id, errorMessage);
    } catch (sendError) {
      logger.error("Failed to send error message", {
        error: sendError instanceof Error ? sendError.message : "Unknown error",
        chatId: msg.chat.id,
      });
    }
  }
}

/**
 * Handle /help command.
 * Sends help text with available commands.
 */
export async function handleHelpCommand(
  bot: TelegramBot,
  msg: TelegramBot.Message
): Promise<void> {
  try {
    // Log incoming command
    logger.info("Command received", {
      command: "/help",
      userId: msg.from?.id,
      username: msg.from?.username,
      chatId: msg.chat.id,
      timestamp: Date.now(),
    });

    // Detect user language
    const language = detectUserLanguage(
      msg.text,
      msg.from?.language_code
    );

    // Get help message based on user's language
    const helpText = getHelpMessage(language);

    // Send help message with Markdown formatting
    await bot.sendMessage(msg.chat.id, helpText, {
      parse_mode: "Markdown",
    });

    logger.info("Help message sent", {
      userId: msg.from?.id,
      chatId: msg.chat.id,
      language,
    });
  } catch (error) {
    logger.error("Error handling /help command", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: msg.from?.id,
      chatId: msg.chat.id,
    });

    // Detect user language for error message
    const language = detectUserLanguage(
      msg.text,
      msg.from?.language_code
    );

    // Send user-friendly error message
    const errorMessage =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء عرض رسالة المساعدة. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error displaying the help message. Please try again.";

    try {
      await bot.sendMessage(msg.chat.id, errorMessage);
    } catch (sendError) {
      logger.error("Failed to send error message", {
        error: sendError instanceof Error ? sendError.message : "Unknown error",
        chatId: msg.chat.id,
      });
    }
  }
}

/**
 * Handle /status command.
 * Queries Convex backend and returns system status with metrics.
 */
export async function handleStatusCommand(
  bot: TelegramBot,
  msg: TelegramBot.Message
): Promise<void> {
  const startTime = Date.now();

  try {
    // Log incoming command
    logger.info("Command received", {
      command: "/status",
      userId: msg.from?.id,
      username: msg.from?.username,
      chatId: msg.chat.id,
      timestamp: startTime,
    });

    // Query Convex backend for system status
    const convexStartTime = Date.now();
    const systemStatus = await convexClient.query(
      "system:getSystemStatus" as any,
      {}
    );
    const convexLatency = Date.now() - convexStartTime;

    // Calculate bot uptime
    const uptimeSeconds = process.uptime();
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);

    // Format uptime string
    let uptimeStr = "";
    if (uptimeDays > 0) {
      uptimeStr += `${uptimeDays}d `;
    }
    if (uptimeHours % 24 > 0) {
      uptimeStr += `${uptimeHours % 24}h `;
    }
    if (uptimeMinutes % 60 > 0) {
      uptimeStr += `${uptimeMinutes % 60}m `;
    }
    uptimeStr += `${Math.floor(uptimeSeconds % 60)}s`;

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    // Format timestamp
    const timestamp = new Date(systemStatus.timestamp).toISOString();

    // Build status message
    const statusMessage =
      `🤖 *System Status*\n\n` +
      `*Backend Status:* ${systemStatus.status === "healthy" ? "✅" : "❌"} ${systemStatus.status}\n` +
      `*Backend Version:* ${systemStatus.version}\n` +
      `*Backend Latency:* ${convexLatency}ms\n` +
      `*Backend Message:* ${systemStatus.message}\n\n` +
      `*Bot Uptime:* ${uptimeStr}\n` +
      `*Memory Usage:* ${memoryMB}MB / ${memoryTotalMB}MB\n` +
      `*Timestamp:* ${timestamp}\n\n` +
      `_All systems operational_ ✨`;

    // Send status message
    await bot.sendMessage(msg.chat.id, statusMessage, {
      parse_mode: "Markdown",
    });

    const totalLatency = Date.now() - startTime;

    logger.info("Status command completed", {
      userId: msg.from?.id,
      chatId: msg.chat.id,
      convexLatency,
      totalLatency,
      backendStatus: systemStatus.status,
      backendVersion: systemStatus.version,
    });
  } catch (error) {
    // Detect user language
    const language = detectUserLanguage(
      msg.text,
      msg.from?.language_code
    );

    // Handle error with bilingual support
    const errorMessage = handleConvexError(error, language, {
      command: "/status",
      userId: msg.from?.id,
      chatId: msg.chat.id,
      deploymentUrl: getMaskedConvexUrl(),
    });

    // Send user-friendly error message
    try {
      await bot.sendMessage(msg.chat.id, errorMessage, {
        parse_mode: "Markdown",
      });
    } catch (sendError) {
      logger.error("Failed to send error message", {
        error: sendError instanceof Error ? sendError.message : "Unknown error",
        chatId: msg.chat.id,
      });
    }
  }
}

/**
 * Register all command handlers with the bot instance.
 */
export function registerCommandHandlers(bot: TelegramBot): void {
  // Register /start command
  bot.onText(/\/start/, (msg) => handleStartCommand(bot, msg));

  // Register /help command
  bot.onText(/\/help/, (msg) => handleHelpCommand(bot, msg));

  // Register /status command
  bot.onText(/\/status/, (msg) => handleStatusCommand(bot, msg));

  logger.info("Command handlers registered", {
    commands: ["/start", "/help", "/status"],
  });
}
