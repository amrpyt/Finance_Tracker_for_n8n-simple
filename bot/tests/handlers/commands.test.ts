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

// Mock Convex generated API
jest.mock("../../convex/_generated/api", () => ({
  api: {
    users: {
      createOrGetUser: "users:createOrGetUser",
      getUserByTelegramId: "users:getUserByTelegramId",
    },
    system: {
      getSystemStatus: "system:getSystemStatus",
    },
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

    it("should send personalized welcome message for new users in English", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "John",
          languagePreference: "en",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("Welcome, John!"),
        expect.objectContaining({ parse_mode: "Markdown" })
      );
      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("personal finance assistant"),
        expect.objectContaining({ parse_mode: "Markdown" })
      );
    });

    it("should send personalized welcome message for new users in Arabic", async () => {
      const mockUserResult = {
        user: {
          _id: "user123",
          telegramUserId: "987654321",
          firstName: "أحمد",
          languagePreference: "ar",
          createdAt: Date.now(),
        },
        isNewUser: true,
      };

      (convexClient.mutation as jest.Mock).mockResolvedValueOnce(mockUserResult);

      await handleStartCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("أهلاً، أحمد!"),
        expect.objectContaining({ parse_mode: "Markdown" })
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
        expect.stringContaining("Welcome back, Sara!"),
        expect.objectContaining({ parse_mode: "Markdown" })
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
    it("should send help message in English with Markdown formatting", async () => {
      await handleHelpCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("Finance Tracker Bot - Help"),
        expect.objectContaining({ parse_mode: "Markdown" })
      );
      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("/start"),
        expect.objectContaining({ parse_mode: "Markdown" })
      );
    });

    it("should send help message in Arabic for Arabic users", async () => {
      mockMessage.from!.language_code = "ar";

      await handleHelpCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("بوت تتبع المالية - مساعدة"),
        expect.objectContaining({ parse_mode: "Markdown" })
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

    it("should log message sent with language", async () => {
      await handleHelpCommand(mockBot, mockMessage);

      expect(logger.info).toHaveBeenCalledWith(
        "Help message sent",
        expect.objectContaining({
          userId: 987654321,
          chatId: 123456789,
          language: "en",
        })
      );
    });

    it("should handle errors gracefully and send error message", async () => {
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

      // Should attempt to send error message
      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("error displaying the help message")
      );
    });

    it("should send Arabic error message for Arabic users", async () => {
      const error = new Error("Send message failed");
      mockMessage.from!.language_code = "ar";
      mockBot.sendMessage.mockRejectedValueOnce(error).mockResolvedValueOnce({} as any);

      await handleHelpCommand(mockBot, mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        123456789,
        expect.stringContaining("عذراً")
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
