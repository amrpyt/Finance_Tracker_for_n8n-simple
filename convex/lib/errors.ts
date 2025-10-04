/**
 * Error handling utilities for Convex functions
 * Provides bilingual error messages (English/Arabic)
 */

export interface BilingualMessage {
  en: string;
  ar: string;
}

/**
 * Custom error class with bilingual user messages
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public userMessage: BilingualMessage
  ) {
    super(userMessage.en);
    this.name = "AppError";
  }
}

/**
 * Error factory functions for common validation errors
 */

export function throwInvalidAccountName() {
  throw new AppError("INVALID_NAME", {
    en: "Account name must be between 1 and 50 characters",
    ar: "يجب أن يكون اسم الحساب بين 1 و 50 حرفاً",
  });
}

export function throwInvalidBalance() {
  throw new AppError("INVALID_BALANCE", {
    en: "Initial balance cannot be negative for bank or cash accounts",
    ar: "لا يمكن أن يكون الرصيد الأولي سالباً لحسابات البنك أو النقد",
  });
}

export function throwInvalidAccountType() {
  throw new AppError("INVALID_TYPE", {
    en: "Account type must be 'bank', 'cash', or 'credit'",
    ar: "يجب أن يكون نوع الحساب 'بنك' أو 'نقد' أو 'ائتمان'",
  });
}

export function throwInternalError() {
  throw new AppError("INTERNAL_ERROR", {
    en: "An unexpected error occurred. Please try again.",
    ar: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
  });
}

export function throwUnauthorized() {
  throw new AppError("UNAUTHORIZED", {
    en: "You are not authorized to perform this action",
    ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
  });
}

/**
 * AI-specific error factory functions
 */

export function throwAITimeout() {
  throw new AppError("AI_TIMEOUT", {
    en: "AI service is taking too long to respond. Please try again.",
    ar: "خدمة الذكاء الاصطناعي تستغرق وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى.",
  });
}

export function throwAIRateLimit() {
  throw new AppError("AI_RATE_LIMIT", {
    en: "Too many AI requests. Please wait a moment and try again.",
    ar: "طلبات ذكاء اصطناعي كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى.",
  });
}

export function throwAIInvalidResponse() {
  throw new AppError("AI_INVALID_RESPONSE", {
    en: "Received invalid response from AI service. Please try again.",
    ar: "تم استلام استجابة غير صالحة من خدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
  });
}

export function throwAIServiceUnavailable() {
  throw new AppError("AI_SERVICE_UNAVAILABLE", {
    en: "AI service is temporarily unavailable. Please try again later.",
    ar: "خدمة الذكاء الاصطناعي غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.",
  });
}

export function throwMissingAPIKey() {
  throw new AppError("MISSING_API_KEY", {
    en: "AI service is not configured. Please contact support.",
    ar: "خدمة الذكاء الاصطناعي غير مكوّنة. يرجى الاتصال بالدعم.",
  });
}

/**
 * Transaction-specific error factory functions
 */

export function throwInvalidAmount() {
  throw new AppError("INVALID_AMOUNT", {
    en: "Amount must be a positive number",
    ar: "يجب أن يكون المبلغ رقماً موجباً",
  });
}

export function throwInvalidDescription() {
  throw new AppError("INVALID_DESCRIPTION", {
    en: "Description must be between 1 and 200 characters",
    ar: "يجب أن يكون الوصف بين 1 و 200 حرفاً",
  });
}

export function throwInvalidCategory() {
  throw new AppError("INVALID_CATEGORY", {
    en: "Invalid transaction category",
    ar: "فئة المعاملة غير صالحة",
  });
}

export function throwAccountNotFound() {
  throw new AppError("ACCOUNT_NOT_FOUND", {
    en: "Account not found",
    ar: "الحساب غير موجود",
  });
}

export function throwInsufficientBalance() {
  throw new AppError("INSUFFICIENT_BALANCE", {
    en: "Insufficient account balance",
    ar: "رصيد الحساب غير كافٍ",
  });
}

export function throwTransactionNotFound() {
  throw new AppError("TRANSACTION_NOT_FOUND", {
    en: "Transaction not found",
    ar: "المعاملة غير موجودة",
  });
}
