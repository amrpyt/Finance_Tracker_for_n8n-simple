/**
 * Unit tests for AI integration
 * Tests Rork API client, retry logic, and response parsing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callRorkLLM, parseAIResponse, RorkResponse } from "../lib/rork";
import { AppError } from "../lib/errors";

// Mock global fetch
global.fetch = vi.fn();

describe("Rork API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set mock API key
    process.env.RORK_API_KEY = "test-api-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("callRorkLLM", () => {
    it("should successfully call Rork API and return response", async () => {
      const mockResponse = {
        content: "Extracted expense",
        function_call: {
          name: "log_expense",
          arguments: JSON.stringify({
            amount: 50,
            description: "coffee",
            category: "Food & Drinks",
            confidence: 0.9,
          }),
        },
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "I spent 50 EGP on coffee",
        systemPrompt: "You are a financial assistant",
        functions: [],
      });

      expect(result.content).toBe("Extracted expense");
      expect(result.functionCall).toEqual({
        name: "log_expense",
        arguments: JSON.stringify({
          amount: 50,
          description: "coffee",
          category: "Food & Drinks",
          confidence: 0.9,
        }),
      });
      expect(result.usage).toBeDefined();
    });

    it("should retry on 500 server error", async () => {
      // First call fails with 500
      (global.fetch as any).mockResolvedValueOnce({
        status: 500,
        headers: new Map(),
      });

      // Second call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          content: "Success after retry",
        }),
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "test",
        systemPrompt: "test",
      });

      expect(result.content).toBe("Success after retry");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should retry on timeout", async () => {
      // First call times out
      (global.fetch as any).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject({ name: "AbortError" }), 10);
        });
      });

      // Second call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          content: "Success after timeout",
        }),
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "test",
        systemPrompt: "test",
      });

      expect(result.content).toBe("Success after timeout");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should handle rate limiting (429) with retry", async () => {
      // First call rate limited
      (global.fetch as any).mockResolvedValueOnce({
        status: 429,
        headers: new Map([["Retry-After", "1"]]),
      });

      // Second call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          content: "Success after rate limit",
        }),
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "test",
        systemPrompt: "test",
      });

      expect(result.content).toBe("Success after rate limit");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should throw AppError after max retries exhausted", async () => {
      // All calls fail with 500
      (global.fetch as any).mockResolvedValue({
        status: 500,
        headers: new Map(),
      });

      await expect(
        callRorkLLM({
          message: "test",
          systemPrompt: "test",
        })
      ).rejects.toThrow(AppError);

      // Should retry 3 times (initial + 3 retries = 4 total)
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it("should not retry on 4xx client errors", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 400,
        text: async () => "Bad request",
        headers: new Map(),
      });

      await expect(
        callRorkLLM({
          message: "test",
          systemPrompt: "test",
        })
      ).rejects.toThrow(AppError);

      // Should not retry on client error
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should throw error if API key is missing", async () => {
      delete process.env.RORK_API_KEY;

      await expect(
        callRorkLLM({
          message: "test",
          systemPrompt: "test",
        })
      ).rejects.toThrow(AppError);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should throw error on invalid response structure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          // Missing 'content' field
          invalid: "response",
        }),
        headers: new Map(),
      });

      await expect(
        callRorkLLM({
          message: "test",
          systemPrompt: "test",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("parseAIResponse", () => {
    it("should parse function call response correctly", () => {
      const response: RorkResponse = {
        content: "Logging expense",
        functionCall: {
          name: "log_expense",
          arguments: JSON.stringify({
            amount: 100,
            description: "groceries",
            category: "Food & Drinks",
            confidence: 0.95,
            reasoning: "User mentioned spending on groceries",
            clarification_needed: false,
          }),
        },
      };

      const parsed = parseAIResponse(response);

      expect(parsed.intent).toBe("log_expense");
      expect(parsed.entities.amount).toBe(100);
      expect(parsed.entities.description).toBe("groceries");
      expect(parsed.confidence).toBe(0.95);
      expect(parsed.nextAction).toBe("execute"); // High confidence
      expect(parsed.clarificationNeeded).toBe(false);
    });

    it("should determine 'confirm' action for medium confidence", () => {
      const response: RorkResponse = {
        content: "Logging expense",
        functionCall: {
          name: "log_expense",
          arguments: JSON.stringify({
            amount: 50,
            description: "taxi",
            confidence: 0.75, // Medium confidence
          }),
        },
      };

      const parsed = parseAIResponse(response);

      expect(parsed.nextAction).toBe("confirm");
    });

    it("should determine 'clarify' action for low confidence", () => {
      const response: RorkResponse = {
        content: "Need clarification",
        functionCall: {
          name: "ask_clarification",
          arguments: JSON.stringify({
            question: "How much did you spend?",
            confidence: 0.5, // Low confidence
            clarification_needed: true,
          }),
        },
      };

      const parsed = parseAIResponse(response);

      expect(parsed.nextAction).toBe("clarify");
      expect(parsed.clarificationNeeded).toBe(true);
    });

    it("should parse JSON content when no function call", () => {
      const response: RorkResponse = {
        content: JSON.stringify({
          intent: "check_balance",
          entities: { accountId: "default" },
          confidence: 0.9,
        }),
      };

      const parsed = parseAIResponse(response);

      expect(parsed.intent).toBe("check_balance");
      expect(parsed.entities.accountId).toBe("default");
      expect(parsed.confidence).toBe(0.9);
    });

    it("should handle plain text content as clarification request", () => {
      const response: RorkResponse = {
        content: "I'm not sure what you mean. Can you clarify?",
      };

      const parsed = parseAIResponse(response);

      expect(parsed.intent).toBe("ask_clarification");
      expect(parsed.nextAction).toBe("clarify");
      expect(parsed.clarificationNeeded).toBe(true);
      expect(parsed.confidence).toBeLessThan(0.7);
    });

    it("should throw AppError on malformed JSON in function call", () => {
      const response: RorkResponse = {
        content: "Error",
        functionCall: {
          name: "log_expense",
          arguments: "{ invalid json",
        },
      };

      expect(() => parseAIResponse(response)).toThrow(AppError);
    });
  });

  describe("Agentic Behavior Tests", () => {
    it("should handle ambiguous input (missing amount)", async () => {
      const mockResponse = {
        content: "Need amount",
        function_call: {
          name: "ask_clarification",
          arguments: JSON.stringify({
            question: "How much did you spend?",
            missingInfo: ["amount"],
            partialData: { description: "coffee" },
            confidence: 0.4,
            reasoning: "User mentioned coffee but no amount",
            clarification_needed: true,
          }),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "I bought coffee",
        systemPrompt: "You are a financial assistant",
      });

      const parsed = parseAIResponse(result);

      expect(parsed.intent).toBe("ask_clarification");
      expect(parsed.entities.missingInfo).toContain("amount");
      expect(parsed.nextAction).toBe("clarify");
    });

    it("should handle context-aware request (another one)", async () => {
      const mockResponse = {
        content: "Logging another expense",
        function_call: {
          name: "log_expense",
          arguments: JSON.stringify({
            amount: 50,
            description: "coffee",
            category: "Food & Drinks",
            confidence: 0.85,
            reasoning: "User said 'another one', referencing previous coffee purchase",
          }),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "another one",
        systemPrompt: "Previous transaction: coffee 50 EGP",
      });

      const parsed = parseAIResponse(result);

      expect(parsed.intent).toBe("log_expense");
      expect(parsed.entities.description).toBe("coffee");
      expect(parsed.entities.amount).toBe(50);
    });

    it("should handle multi-step reasoning (weekly spending)", async () => {
      const mockResponse = {
        content: "Searching transactions",
        function_call: {
          name: "search_transactions",
          arguments: JSON.stringify({
            dateRange: { start: "this week", end: "today" },
            category: "Food & Drinks",
            aggregation: "sum",
            confidence: 0.9,
            reasoning: "User wants total spending on food this week",
          }),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "how much did I spend on food this week?",
        systemPrompt: "You are a financial assistant",
      });

      const parsed = parseAIResponse(result);

      expect(parsed.intent).toBe("search_transactions");
      expect(parsed.entities.category).toBe("Food & Drinks");
      expect(parsed.entities.aggregation).toBe("sum");
    });

    it("should handle bilingual prompt (Arabic)", async () => {
      const mockResponse = {
        content: "تسجيل مصروف",
        function_call: {
          name: "log_expense",
          arguments: JSON.stringify({
            amount: 30,
            description: "قهوة",
            category: "Food & Drinks",
            confidence: 0.9,
          }),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockResponse,
        headers: new Map(),
      });

      const result = await callRorkLLM({
        message: "صرفت ٣٠ جنيه على قهوة",
        systemPrompt: "أنت مساعد مالي",
      });

      const parsed = parseAIResponse(result);

      expect(parsed.intent).toBe("log_expense");
      expect(parsed.entities.amount).toBe(30);
    });
  });
});
