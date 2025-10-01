import TelegramBot from "node-telegram-bot-api";
import { handleStartCommand, handleHelpCommand } from "../../src/handlers/commands";
import logger from "../../src/utils/logger";

// Mock the logger
jest.mock("../../src/utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Command Handlers", () => {
  let mockBot: jest.Mocked<TelegramBot>;
  let mockMessage: TelegramBot.Message;

  beforeEach(() => {
    // Create mock bot instance
    mockBot = {
      sendMessage: jest.fn().mockResolvedValue({}),
    } as any;

    // Create mock message
    mockMessage = {
      chat: {
        id: 123456789,
        type: "private",
      },
      from: {
        id: 987654321,
        is_bot: false,
        first_name: "Test",
        username: "testuser",
      },
      message_id: 1,
      date: Date.now(),
      text: "",
    } as TelegramBot.Message;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("handleStartCommand", () => {
    it("should send welcome message", async () => {
      await handleStartCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        "Hello! I'm your finance bot."
      );
    });

    it("should log command received", async () => {
      await handleStartCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Command received",
        expect.objectContaining({
          command: "/start",
          userId: 987654321,
          username: "testuser",
          chatId: 123456789,
        })
      );
    });

    it("should log message sent", async () => {
      await handleStartCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Welcome message sent",
        expect.objectContaining({
          userId: 987654321,
          chatId: 123456789,
        })
      );
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Send message failed");
      mockBot.sendMessage.mockRejectedValueOnce(error);

      await handleStartCommand(mockBot, mockMessage);

      expect(logger.error).toHaveBeenCalledWith(
        "Error handling /start command",
        expect.objectContaining({
          error: "Send message failed",
          userId: 987654321,
          chatId: 123456789,
        })
      );
    });
  });

  describe("handleHelpCommand", () => {
    it("should send help message with available commands", async () => {
      await handleHelpCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        "Available commands:\n/start - Start the bot\n/help - Show this help message"
      );
    });

    it("should log command received", async () => {
      await handleHelpCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Command received",
        expect.objectContaining({
          command: "/help",
          userId: 987654321,
          username: "testuser",
          chatId: 123456789,
        })
      );
    });

    it("should log message sent", async () => {
      await handleHelpCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Help message sent",
        expect.objectContaining({
          userId: 987654321,
          chatId: 123456789,
        })
      );
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Send message failed");
      mockBot.sendMessage.mockRejectedValueOnce(error);

      await handleHelpCommand(mockBot, mockMessage);

      expect(logger.error).toHaveBeenCalledWith(
        "Error handling /help command",
        expect.objectContaining({
          error: "Send message failed",
          userId: 987654321,
          chatId: 123456789,
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should not crash bot when handler throws error", async () => {
      mockBot.sendMessage.mockRejectedValueOnce(new Error("Network error"));

      // Should not throw
      await expect(handleStartCommand(mockBot, mockMessage)).resolves.not.toThrow();
      await expect(handleHelpCommand(mockBot, mockMessage)).resolves.not.toThrow();
    });
  });
});
