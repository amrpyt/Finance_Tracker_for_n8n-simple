import TelegramBot from "node-telegram-bot-api";
import { handleStartCommand, handleHelpCommand } from "../../src/handlers/commands";
import logger from "../../src/utils/logger";
import { convexClient } from "../../src/config/convex";

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

// Mock Convex client
jest.mock("../../src/config/convex", () => ({
  convexClient: {
    mutation: jest.fn(),
    query: jest.fn(),
  },
  getMaskedConvexUrl: jest.fn(() => "https://*****.convex.cloud"),
}));

// Mock error utilities
jest.mock("../../src/utils/errors", () => ({
  handleConvexError: jest.fn((error, language) => {
    return language === "ar"
      ? "عذراً، حدث خطأ"
      : "Sorry, an error occurred";
  }),
  detectUserLanguage: jest.fn((text, languageCode) => {
    return languageCode === "ar" ? "ar" : "en";
  }),
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
    it("should call createOrGetUser with correct Telegram data", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          username: "testuser",
          firstName: "Test",
          languagePreference: "en",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(convexClient.mutation).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          telegramUserId: "987654321",
          username: "testuser",
          firstName: "Test",
          languageCode: undefined,
        })
      );
    });

    it("should send personalized welcome message for new users", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "Ahmed",
          languagePreference: "ar",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("Welcome, Ahmed!")
      );
      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("personal finance assistant")
      );
    });

    it("should send welcome back message for existing users", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "Sara",
          languagePreference: "en",
          createdAt: Date.now(),
        },
        isNewUser: false,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("Welcome back, Sara!")
      );
    });

    it("should extract language_code from Telegram user object", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "Test",
          languagePreference: "ar",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      mockMessage.from!.language_code = "ar";
      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(convexClient.mutation).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          languageCode: "ar",
        })
      );
    });

    it("should log command received", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "Test",
          languagePreference: "en",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

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

    it("should log user registration completion", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "Test",
          languagePreference: "en",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "User registration completed",
        expect.objectContaining({
          userId: 987654321,
          isNewUser: true,
          languagePreference: "en",
        })
      );
    });

    it("should handle Convex mutation errors gracefully", async () => {
      const error = new Error("Convex connection failed");
      (convexClient.mutation as jest.Mock).mockRejectedValueOnce(error);

      await handleStartCommand(mockBot, mockMessage);

      expect(logger.error).toHaveBeenCalledWith(
        "Error handling /start command",
        expect.objectContaining({
          error: "Convex connection failed",
          userId: 987654321,
          chatId: 123456789,
        })
      );

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("error setting up your profile")
      );
    });

    it("should send Arabic error message for Arabic users", async () => {
      const error = new Error("Convex error");
      mockMessage.from!.language_code = "ar";
      (convexClient.mutation as jest.Mock).mockRejectedValueOnce(error);

      await handleStartCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("عذراً")
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
