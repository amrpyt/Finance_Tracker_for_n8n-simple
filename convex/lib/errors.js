"use strict";
/**
 * Error handling utilities for Convex functions
 * Provides bilingual error messages (English/Arabic)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.throwInvalidAccountName = throwInvalidAccountName;
exports.throwInvalidBalance = throwInvalidBalance;
exports.throwInvalidAccountType = throwInvalidAccountType;
exports.throwInternalError = throwInternalError;
exports.throwUnauthorized = throwUnauthorized;
/**
 * Custom error class with bilingual user messages
 */
class AppError extends Error {
    code;
    userMessage;
    constructor(code, userMessage) {
        super(userMessage.en);
        this.code = code;
        this.userMessage = userMessage;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
/**
 * Error factory functions for common validation errors
 */
function throwInvalidAccountName() {
    throw new AppError("INVALID_NAME", {
        en: "Account name must be between 1 and 50 characters",
        ar: "يجب أن يكون اسم الحساب بين 1 و 50 حرفاً",
    });
}
function throwInvalidBalance() {
    throw new AppError("INVALID_BALANCE", {
        en: "Initial balance cannot be negative for bank or cash accounts",
        ar: "لا يمكن أن يكون الرصيد الأولي سالباً لحسابات البنك أو النقد",
    });
}
function throwInvalidAccountType() {
    throw new AppError("INVALID_TYPE", {
        en: "Account type must be 'bank', 'cash', or 'credit'",
        ar: "يجب أن يكون نوع الحساب 'بنك' أو 'نقد' أو 'ائتمان'",
    });
}
function throwInternalError() {
    throw new AppError("INTERNAL_ERROR", {
        en: "An unexpected error occurred. Please try again.",
        ar: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    });
}
function throwUnauthorized() {
    throw new AppError("UNAUTHORIZED", {
        en: "You are not authorized to perform this action",
        ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
    });
}
