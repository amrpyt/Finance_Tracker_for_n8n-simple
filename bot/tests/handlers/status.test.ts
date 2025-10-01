/**
 * Unit tests for /status command handler
 */

import { jest } from "@jest/globals";
import TelegramBot from "node-telegram-bot-api";

// Mock dependencies
jest.mock("../../src/config/convex", () => ({
  convexClient: {
    query: jest.fn(),
  },
  getMaskedConvexUrl: jest.fn(() => "https://***-***.convex.cloud"),
}));

jest.mock("../../src/utils/logger", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("/status Command Handler", () => {
  let handleStatusCommand: any;
  let convexClient: any;
  let logger: any;
  let mockBot: any;
  let mockMessage: TelegramBot.Message;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Import mocked modules
    const convexModule = await import("../../src/config/convex");
    const loggerModule = await import("../../src/utils/logger");
    const handlersModule = await import("../../src/handlers/commands");

    convexClient = convexModule.convexClient;
    logger = loggerModule.default;
    handleStatusCommand = handlersModule.handleStatusCommand;

    // Create mock bot
    mockBot = {
      sendMessage: jest.fn().mockResolvedValue({}),
    };

    // Create mock message
    mockMessage = {
      chat: { id: 123456, type: "private" },
      from: { id: 789, username: "testuser", first_name: "Test" },
      message_id: 1,
      date: Date.now(),
      text: "/status",
    } as any;
  });

  describe("Successful Status Check", () => {
    it("should query Convex and send formatted status message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      expect(convexClient.query).toHaveBeenCalledWith(
        "system:getSystemStatus",
        {}
      );
      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456,
        expect.stringContaining("System Status"),
        { parse_mode: "Markdown" }
      );
    });

    it("should include backend status in message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Backend Status:");
      expect(sentMessage).toContain("healthy");
      expect(sentMessage).toContain("✅");
    });

    it("should include backend version in message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Backend Version:");
      expect(sentMessage).toContain("1.0.0");
    });

    it("should include backend latency in message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Backend Latency:");
      expect(sentMessage).toMatch(/\d+ms/);
    });

    it("should include bot uptime in message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Bot Uptime:");
    });

    it("should include memory usage in message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Memory Usage:");
      expect(sentMessage).toMatch(/\d+MB/);
    });

    it("should include timestamp in message", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Timestamp:");
    });

    it("should log command received", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Command received",
        expect.objectContaining({
          command: "/status",
          userId: 789,
        })
      );
    });

    it("should log command completion with metrics", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Status command completed",
        expect.objectContaining({
          convexLatency: expect.any(Number),
          totalLatency: expect.any(Number),
          backendStatus: "healthy",
          backendVersion: "1.0.0",
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle Convex query failure gracefully", async () => {
      (convexClient.query as jest.Mock).mockRejectedValueOnce(
        new Error("Connection failed")
      );

      await handleStatusCommand(mockBot, mockMessage);

      expect(logger.error).toHaveBeenCalledWith(
        "Error handling /status command",
        expect.objectContaining({
          error: "Connection failed",
          userId: 789,
        })
      );
    });

    it("should send user-friendly error message on failure", async () => {
      (convexClient.query as jest.Mock).mockRejectedValueOnce(
        new Error("Timeout")
      );

      await handleStatusCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456,
        expect.stringContaining("System Status Check Failed"),
        { parse_mode: "Markdown" }
      );
    });

    it("should include masked URL in error logs", async () => {
      (convexClient.query as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      await handleStatusCommand(mockBot, mockMessage);

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deploymentUrl: "https://***-***.convex.cloud",
        })
      );
    });

    it("should handle error when sending error message fails", async () => {
      (convexClient.query as jest.Mock).mockRejectedValueOnce(
        new Error("Query failed")
      );
      (mockBot.sendMessage as jest.Mock).mockRejectedValueOnce(
        new Error("Send failed")
      );

      await handleStatusCommand(mockBot, mockMessage);

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to send error message",
        expect.objectContaining({
          error: "Send failed",
        })
      );
    });
  });

  describe("Uptime Formatting", () => {
    it("should format uptime correctly for seconds only", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toMatch(/Bot Uptime:.*\d+s/);
    });
  });

  describe("Status Indicators", () => {
    it("should show green checkmark for healthy status", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("✅");
    });

    it("should show red X for unhealthy status", async () => {
      const mockResponse = {
        status: "unhealthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Backend degraded",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await handleStatusCommand(mockBot, mockMessage);

      const sentMessage = (mockBot.sendMessage as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("❌");
    });
  });
});
