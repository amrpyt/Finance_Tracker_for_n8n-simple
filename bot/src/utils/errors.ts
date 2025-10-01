import logger from "./logger";

/**
 * Supported languages for error messages
 */
export type Language = "en" | "ar";

/**
 * Bilingual error message
 */
export interface BilingualMessage {
  en: string;
  ar: string;
}

/**
 * Error types for Convex connection failures
 */
export enum ConvexErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  INVALID_URL = "INVALID_URL",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Convex error messages with bilingual support
 */
const CONVEX_ERROR_MESSAGES: Record<ConvexErrorType, BilingualMessage> = {
  [ConvexErrorType.NETWORK_ERROR]: {
    en: "❌ *Connection Error*\n\nUnable to connect to the backend server. Please check your internet connection and try again.",
    ar: "❌ *خطأ في الاتصال*\n\nتعذر الاتصال بخادم النظام. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.",
  },
  [ConvexErrorType.TIMEOUT_ERROR]: {
    en: "⏱️ *Request Timeout*\n\nThe request took too long to complete. The server might be experiencing high load. Please try again in a moment.",
    ar: "⏱️ *انتهت مهلة الطلب*\n\nاستغرق الطلب وقتاً طويلاً جداً. قد يكون الخادم تحت حمل كبير. يرجى المحاولة مرة أخرى بعد قليل.",
  },
  [ConvexErrorType.INVALID_URL]: {
    en: "🔗 *Configuration Error*\n\nThe backend URL is not configured correctly. Please contact support.",
    ar: "🔗 *خطأ في الإعدادات*\n\nعنوان الخادم غير مُعد بشكل صحيح. يرجى الاتصال بالدعم الفني.",
  },
  [ConvexErrorType.AUTHENTICATION_ERROR]: {
    en: "🔐 *Authentication Error*\n\nFailed to authenticate with the backend. Please try again or contact support.",
    ar: "🔐 *خطأ في المصادقة*\n\nفشلت المصادقة مع الخادم. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.",
  },
  [ConvexErrorType.UNKNOWN_ERROR]: {
    en: "⚠️ *Unexpected Error*\n\nAn unexpected error occurred. Please try again later.",
    ar: "⚠️ *خطأ غير متوقع*\n\nحدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.",
  },
};

/**
 * Error recovery suggestions with bilingual support
 */
const ERROR_RECOVERY_SUGGESTIONS: Record<ConvexErrorType, BilingualMessage> = {
  [ConvexErrorType.NETWORK_ERROR]: {
    en: "💡 *Suggestions:*\n• Check your internet connection\n• Try again in a few moments\n• Contact support if the problem persists",
    ar: "💡 *اقتراحات:*\n• تحقق من اتصال الإنترنت\n• حاول مرة أخرى بعد لحظات\n• اتصل بالدعم الفني إذا استمرت المشكلة",
  },
  [ConvexErrorType.TIMEOUT_ERROR]: {
    en: "💡 *Suggestions:*\n• Wait a moment and try again\n• The server may be busy\n• Try a simpler command first",
    ar: "💡 *اقتراحات:*\n• انتظر لحظة وحاول مرة أخرى\n• قد يكون الخادم مشغولاً\n• جرب أمراً أبسط أولاً",
  },
  [ConvexErrorType.INVALID_URL]: {
    en: "💡 *Suggestions:*\n• Contact support for assistance\n• This is a configuration issue",
    ar: "💡 *اقتراحات:*\n• اتصل بالدعم الفني للمساعدة\n• هذه مشكلة في الإعدادات",
  },
  [ConvexErrorType.AUTHENTICATION_ERROR]: {
    en: "💡 *Suggestions:*\n• Try the command again\n• Contact support if the issue continues",
    ar: "💡 *اقتراحات:*\n• جرب الأمر مرة أخرى\n• اتصل بالدعم الفني إذا استمرت المشكلة",
  },
  [ConvexErrorType.UNKNOWN_ERROR]: {
    en: "💡 *Suggestions:*\n• Try again in a few moments\n• Contact support if the problem persists",
    ar: "💡 *اقتراحات:*\n• حاول مرة أخرى بعد لحظات\n• اتصل بالدعم الفني إذا استمرت المشكلة",
  },
};

/**
 * Classifies an error into a specific error type
 */
export function classifyConvexError(error: unknown): ConvexErrorType {
  if (!(error instanceof Error)) {
    return ConvexErrorType.UNKNOWN_ERROR;
  }

  const errorMessage = error.message.toLowerCase();

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("econnrefused") ||
    errorMessage.includes("enotfound") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("fetch failed")
  ) {
    return ConvexErrorType.NETWORK_ERROR;
  }

  // Timeout errors
  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("timed out") ||
    errorMessage.includes("etimedout")
  ) {
    return ConvexErrorType.TIMEOUT_ERROR;
  }

  // Invalid URL errors
  if (
    errorMessage.includes("invalid url") ||
    errorMessage.includes("malformed") ||
    errorMessage.includes("https://")
  ) {
    return ConvexErrorType.INVALID_URL;
  }

  // Authentication errors
  if (
    errorMessage.includes("auth") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("401") ||
    errorMessage.includes("403")
  ) {
    return ConvexErrorType.AUTHENTICATION_ERROR;
  }

  return ConvexErrorType.UNKNOWN_ERROR;
}

/**
 * Gets a bilingual error message for a specific error type and language
 */
export function getErrorMessage(
  errorType: ConvexErrorType,
  language: Language = "en"
): string {
  const message = CONVEX_ERROR_MESSAGES[errorType];
  return message[language];
}

/**
 * Gets error recovery suggestions for a specific error type and language
 */
export function getRecoverySuggestions(
  errorType: ConvexErrorType,
  language: Language = "en"
): string {
  const suggestions = ERROR_RECOVERY_SUGGESTIONS[errorType];
  return suggestions[language];
}

/**
 * Formats a complete error message with recovery suggestions
 */
export function formatErrorMessage(
  errorType: ConvexErrorType,
  language: Language = "en"
): string {
  const message = getErrorMessage(errorType, language);
  const suggestions = getRecoverySuggestions(errorType, language);
  return `${message}\n\n${suggestions}`;
}

/**
 * Handles a Convex error and returns a user-friendly message
 */
export function handleConvexError(
  error: unknown,
  language: Language = "en",
  context?: Record<string, any>
): string {
  // Classify the error
  const errorType = classifyConvexError(error);

  // Log detailed error for debugging
  logger.error("Convex error occurred", {
    errorType,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  // Return user-friendly message
  return formatErrorMessage(errorType, language);
}

/**
 * Detects user language from message or user settings
 * For now, defaults to English. Will be enhanced in future stories.
 */
export function detectUserLanguage(
  text?: string,
  userLanguageCode?: string
): Language {
  // Check user's Telegram language code
  if (userLanguageCode?.startsWith("ar")) {
    return "ar";
  }

  // Check if text contains Arabic characters
  if (text && /[\u0600-\u06FF]/.test(text)) {
    return "ar";
  }

  // Default to English
  return "en";
}
