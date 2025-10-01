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
