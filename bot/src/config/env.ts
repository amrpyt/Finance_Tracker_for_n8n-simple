import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: path.join(__dirname, "../../.env") });
}

/**
 * Bot configuration loaded from environment variables.
 * Validates that all required variables are present on startup.
 */
export interface BotConfig {
  telegramBotToken: string;
  convexUrl: string;
  port: number;
  nodeEnv: string;
  logLevel: string;
}

/**
 * Validates that a required environment variable exists.
 * Throws an error with a clear message if the variable is missing.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Please check your .env file and ensure ${name} is set.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value.
 */
function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Load and validate bot configuration from environment variables.
 * Throws an error if any required variables are missing.
 */
export function loadConfig(): BotConfig {
  try {
    const telegramBotToken = requireEnv("TELEGRAM_BOT_TOKEN");
    const convexUrl = requireEnv("CONVEX_URL");

    // Validate CONVEX_URL format
    if (!convexUrl.startsWith("https://")) {
      throw new Error(
        "CONVEX_URL must be a valid HTTPS URL. " +
          `Please check your .env file and ensure CONVEX_URL starts with https://`
      );
    }

    const config: BotConfig = {
      telegramBotToken,
      convexUrl,
      port: parseInt(getEnv("PORT", "3000"), 10),
      nodeEnv: getEnv("NODE_ENV", "development"),
      logLevel: getEnv("LOG_LEVEL", "info"),
    };

    // Log successful configuration load (without exposing sensitive data)
    console.log("✅ Configuration loaded successfully", {
      nodeEnv: config.nodeEnv,
      port: config.port,
      logLevel: config.logLevel,
      hasBotToken: !!config.telegramBotToken,
      hasConvexUrl: !!config.convexUrl,
    });

    return config;
  } catch (error) {
    console.error("❌ Failed to load configuration:", error);
    throw error;
  }
}

// Export singleton config instance
export const config = loadConfig();
