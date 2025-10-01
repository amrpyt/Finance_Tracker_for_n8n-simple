import TelegramBot from "node-telegram-bot-api";
import { config } from "./config/env";
import { closeConvexClient } from "./config/convex";
import { performHealthCheckWithRetry } from "./services/convexHealth";
import logger from "./utils/logger";

/**
 * Initialize and configure the Telegram bot instance.
 * Uses polling mode for development (webhook for production).
 */
export function createBot(): TelegramBot {
  try {
    // Create bot instance with polling configuration
    const bot = new TelegramBot(config.telegramBotToken, {
      polling: {
        interval: 300, // Check for updates every 300ms
        autoStart: true,
        params: {
          timeout: 10, // Long polling timeout in seconds
        },
      },
    });

    // Log successful connection
    console.log("✅ Telegram bot initialized successfully");
    console.log("📡 Polling mode enabled");

    // Handle polling errors with recovery
    bot.on("polling_error", async (error: Error) => {
      logger.error("❌ Polling error occurred", {
        message: error.message,
        code: (error as any).code,
      });

      // Attempt to recover by checking backend health
      logger.info("🔄 Attempting error recovery - checking backend health");
      const healthCheck = await performHealthCheckWithRetry(2, 500);
      
      if (!healthCheck.success) {
        logger.error("❌ Backend health check failed during recovery", {
          error: healthCheck.error,
        });
      } else {
        logger.info("✅ Backend health check passed - continuing operation");
      }
    });

    // Handle general errors
    bot.on("error", (error: Error) => {
      logger.error("❌ Bot error occurred", {
        message: error.message,
      });
    });

    return bot;
  } catch (error) {
    console.error("❌ Failed to initialize Telegram bot:", error);
    throw new Error(
      `Failed to connect to Telegram API: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Gracefully shutdown the bot by stopping polling and closing connections.
 * Prevents message loss and ensures clean exit.
 */
export async function shutdownBot(bot: TelegramBot): Promise<void> {
  try {
    logger.info("🛑 Shutting down bot gracefully...");
    
    // Stop polling first
    logger.debug("Stopping Telegram polling");
    await bot.stopPolling();
    logger.info("✅ Telegram polling stopped");
    
    // Close Convex client connections
    logger.debug("Closing Convex client connections");
    closeConvexClient();
    logger.info("✅ Convex connections closed");
    
    logger.info("✅ Bot shutdown completed successfully");
  } catch (error) {
    logger.error("❌ Error during bot shutdown", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Setup graceful shutdown handlers for SIGINT and SIGTERM signals.
 * Ensures the bot stops polling and closes connections before process exit.
 */
export function setupShutdownHandlers(bot: TelegramBot): void {
  const shutdown = async (signal: string) => {
    logger.info(`\n📥 Received ${signal} signal - initiating graceful shutdown`);
    try {
      await shutdownBot(bot);
      logger.info("👋 Shutdown complete - goodbye!");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Error during shutdown", {
        error: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
