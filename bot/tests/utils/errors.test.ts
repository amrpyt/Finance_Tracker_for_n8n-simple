/**
 * Unit tests for error handling utilities
 */

import {
  classifyConvexError,
  ConvexErrorType,
  getErrorMessage,
  getRecoverySuggestions,
  formatErrorMessage,
  handleConvexError,
  detectUserLanguage,
} from "../../src/utils/errors";

describe("Error Handling Utilities", () => {
  describe("classifyConvexError", () => {
    it("should classify network errors", () => {
      const error = new Error("Network request failed");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.NETWORK_ERROR);
    });

    it("should classify ECONNREFUSED errors", () => {
      const error = new Error("connect ECONNREFUSED 127.0.0.1:3000");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.NETWORK_ERROR);
    });

    it("should classify fetch failed errors", () => {
      const error = new Error("fetch failed");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.NETWORK_ERROR);
    });

    it("should classify timeout errors", () => {
      const error = new Error("Request timeout");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.TIMEOUT_ERROR);
    });

    it("should classify ETIMEDOUT errors", () => {
      const error = new Error("connect ETIMEDOUT");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.TIMEOUT_ERROR);
    });

    it("should classify invalid URL errors", () => {
      const error = new Error("Invalid URL");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.INVALID_URL);
    });

    it("should classify authentication errors", () => {
      const error = new Error("Unauthorized 401");
      expect(classifyConvexError(error)).toBe(
        ConvexErrorType.AUTHENTICATION_ERROR
      );
    });

    it("should classify 403 forbidden errors", () => {
      const error = new Error("Forbidden 403");
      expect(classifyConvexError(error)).toBe(
        ConvexErrorType.AUTHENTICATION_ERROR
      );
    });

    it("should classify unknown errors", () => {
      const error = new Error("Something went wrong");
      expect(classifyConvexError(error)).toBe(ConvexErrorType.UNKNOWN_ERROR);
    });

    it("should handle non-Error objects", () => {
      expect(classifyConvexError("string error")).toBe(
        ConvexErrorType.UNKNOWN_ERROR
      );
      expect(classifyConvexError(null)).toBe(ConvexErrorType.UNKNOWN_ERROR);
      expect(classifyConvexError(undefined)).toBe(
        ConvexErrorType.UNKNOWN_ERROR
      );
    });
  });

  describe("getErrorMessage", () => {
    it("should return English message by default", () => {
      const message = getErrorMessage(ConvexErrorType.NETWORK_ERROR);
      expect(message).toContain("Connection Error");
      expect(message).toContain("❌");
      expect(message).not.toContain("خطأ");
    });

    it("should return Arabic message when specified", () => {
      const message = getErrorMessage(ConvexErrorType.NETWORK_ERROR, "ar");
      expect(message).toContain("خطأ في الاتصال");
      expect(message).toContain("❌");
    });

    it("should return timeout error message", () => {
      const message = getErrorMessage(ConvexErrorType.TIMEOUT_ERROR);
      expect(message).toContain("Timeout");
      expect(message).toContain("⏱️");
    });

    it("should return invalid URL error message", () => {
      const message = getErrorMessage(ConvexErrorType.INVALID_URL);
      expect(message).toContain("Configuration Error");
      expect(message).toContain("🔗");
    });

    it("should return authentication error message", () => {
      const message = getErrorMessage(ConvexErrorType.AUTHENTICATION_ERROR);
      expect(message).toContain("Authentication Error");
      expect(message).toContain("🔐");
    });

    it("should return unknown error message", () => {
      const message = getErrorMessage(ConvexErrorType.UNKNOWN_ERROR);
      expect(message).toContain("Unexpected Error");
      expect(message).toContain("⚠️");
    });
  });

  describe("getRecoverySuggestions", () => {
    it("should return English suggestions by default", () => {
      const suggestions = getRecoverySuggestions(
        ConvexErrorType.NETWORK_ERROR
      );
      expect(suggestions).toContain("Suggestions");
      expect(suggestions).toContain("internet connection");
      expect(suggestions).toContain("💡");
    });

    it("should return Arabic suggestions when specified", () => {
      const suggestions = getRecoverySuggestions(
        ConvexErrorType.NETWORK_ERROR,
        "ar"
      );
      expect(suggestions).toContain("اقتراحات");
      expect(suggestions).toContain("الإنترنت");
      expect(suggestions).toContain("💡");
    });

    it("should include actionable steps", () => {
      const suggestions = getRecoverySuggestions(
        ConvexErrorType.NETWORK_ERROR
      );
      expect(suggestions).toContain("•");
      expect(suggestions.split("•").length).toBeGreaterThan(2);
    });
  });

  describe("formatErrorMessage", () => {
    it("should combine error message and suggestions", () => {
      const formatted = formatErrorMessage(ConvexErrorType.NETWORK_ERROR);
      expect(formatted).toContain("Connection Error");
      expect(formatted).toContain("Suggestions");
      expect(formatted).toContain("\n\n");
    });

    it("should format in Arabic when specified", () => {
      const formatted = formatErrorMessage(ConvexErrorType.NETWORK_ERROR, "ar");
      expect(formatted).toContain("خطأ في الاتصال");
      expect(formatted).toContain("اقتراحات");
    });

    it("should include emojis in formatted message", () => {
      const formatted = formatErrorMessage(ConvexErrorType.TIMEOUT_ERROR);
      expect(formatted).toContain("⏱️");
      expect(formatted).toContain("💡");
    });
  });

  describe("handleConvexError", () => {
    it("should classify and format error", () => {
      const error = new Error("Network request failed");
      const result = handleConvexError(error);
      expect(result).toContain("Connection Error");
      expect(result).toContain("Suggestions");
    });

    it("should handle error in Arabic", () => {
      const error = new Error("timeout");
      const result = handleConvexError(error, "ar");
      expect(result).toContain("انتهت مهلة الطلب");
      expect(result).toContain("اقتراحات");
    });

    it("should handle non-Error objects", () => {
      const result = handleConvexError("string error");
      expect(result).toContain("Unexpected Error");
    });

    it("should accept context for logging", () => {
      const error = new Error("test error");
      const context = { userId: 123, command: "/test" };
      const result = handleConvexError(error, "en", context);
      expect(result).toBeDefined();
    });
  });

  describe("detectUserLanguage", () => {
    it("should default to English", () => {
      expect(detectUserLanguage()).toBe("en");
    });

    it("should detect Arabic from language code", () => {
      expect(detectUserLanguage(undefined, "ar")).toBe("ar");
      expect(detectUserLanguage(undefined, "ar-SA")).toBe("ar");
      expect(detectUserLanguage(undefined, "ar-EG")).toBe("ar");
    });

    it("should detect Arabic from text content", () => {
      const arabicText = "مرحبا بك";
      expect(detectUserLanguage(arabicText)).toBe("ar");
    });

    it("should detect Arabic from mixed content", () => {
      const mixedText = "Hello مرحبا";
      expect(detectUserLanguage(mixedText)).toBe("ar");
    });

    it("should return English for non-Arabic language codes", () => {
      expect(detectUserLanguage(undefined, "en")).toBe("en");
      expect(detectUserLanguage(undefined, "es")).toBe("en");
      expect(detectUserLanguage(undefined, "fr")).toBe("en");
    });

    it("should return English for English text", () => {
      expect(detectUserLanguage("Hello world")).toBe("en");
    });

    it("should prioritize language code over text", () => {
      expect(detectUserLanguage("Hello", "ar")).toBe("ar");
    });
  });

  describe("Bilingual Message Coverage", () => {
    const errorTypes = [
      ConvexErrorType.NETWORK_ERROR,
      ConvexErrorType.TIMEOUT_ERROR,
      ConvexErrorType.INVALID_URL,
      ConvexErrorType.AUTHENTICATION_ERROR,
      ConvexErrorType.UNKNOWN_ERROR,
    ];

    errorTypes.forEach((errorType) => {
      it(`should have both English and Arabic messages for ${errorType}`, () => {
        const enMessage = getErrorMessage(errorType, "en");
        const arMessage = getErrorMessage(errorType, "ar");

        expect(enMessage).toBeDefined();
        expect(enMessage.length).toBeGreaterThan(0);
        expect(arMessage).toBeDefined();
        expect(arMessage.length).toBeGreaterThan(0);
        expect(enMessage).not.toBe(arMessage);
      });

      it(`should have both English and Arabic suggestions for ${errorType}`, () => {
        const enSuggestions = getRecoverySuggestions(errorType, "en");
        const arSuggestions = getRecoverySuggestions(errorType, "ar");

        expect(enSuggestions).toBeDefined();
        expect(enSuggestions.length).toBeGreaterThan(0);
        expect(arSuggestions).toBeDefined();
        expect(arSuggestions.length).toBeGreaterThan(0);
        expect(enSuggestions).not.toBe(arSuggestions);
      });
    });
  });
});
