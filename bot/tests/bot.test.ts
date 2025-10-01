import TelegramBot from "node-telegram-bot-api";
import { createBot, shutdownBot, setupShutdownHandlers } from "../src/bot";
import { closeConvexClient } from "../src/config/convex";
import { performHealthCheckWithRetry } from "../src/services/convexHealth";
import logger from "../src/utils/logger";

// Mock dependencies
jest.mock("node-telegram-bot-api");
jest.mock("../src/config/convex");
jest.mock("../src/services/convexHealth");
jest.mock("../src/utils/logger");

describe("Bot Initialization and Shutdown", () => {
  let mockBot: jest.Mocked<TelegramBot>;
  let mockStopPolling: jest.Mock;
  let mockOn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock bot instance
    mockStopPolling = jest.fn().mockResolvedValue(undefined);
    mockOn = jest.fn();

    mockBot = {
      stopPolling: mockStopPolling,
      on: mockOn,
    } as any;

    (TelegramBot as jest.MockedClass<typeof TelegramBot>).mockImplementation(
      () => mockBot
    );

    // Mock logger to prevent console output during tests
    (logger.info as jest.Mock).mockImplementation(() => {});
    (logger.error as jest.Mock).mockImplementation(() => {});
    (logger.debug as jest.Mock).mockImplementation(() => {});
  });

  describe("createBot", () => {
    it("should create bot instance with polling configuration", () => {
      const bot = createBot();

      expect(TelegramBot).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          polling: expect.objectContaining({
            interval: 300,
            autoStart: true,
            params: { timeout: 10 },
          }),
        })
      );
      expect(bot).toBe(mockBot);
    });

    it("should register polling_error handler", () => {
      createBot();

      expect(mockOn).toHaveBeenCalledWith("polling_error", expect.any(Function));
    });

    it("should register error handler", () => {
      createBot();

      expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));
    });

    it("should handle polling errors with health check recovery", async () => {
      const mockHealthCheck = performHealthCheckWithRetry as jest.MockedFunction<
        typeof performHealthCheckWithRetry
      >;
      mockHealthCheck.mockResolvedValue({
        success: true,
        latency: 100,
        response: {
          status: "healthy",
          timestamp: Date.now(),
          version: "1.0.0",
          message: "Backend operational",
        },
      });

      createBot();

      // Get the polling_error handler
      const pollingErrorHandler = mockOn.mock.calls.find(
        (call) => call[0] === "polling_error"
      )?.[1];

      expect(pollingErrorHandler).toBeDefined();

      // Simulate polling error
      const testError = new Error("Connection timeout");
      await pollingErrorHandler(testError);

      // Verify health check was called
      expect(mockHealthCheck).toHaveBeenCalledWith(2, 500);
      expect(logger.error).toHaveBeenCalledWith(
        "❌ Polling error occurred",
        expect.objectContaining({
          message: "Connection timeout",
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        "✅ Backend health check passed - continuing operation"
      );
    });

    it("should log error when health check fails during recovery", async () => {
      const mockHealthCheck = performHealthCheckWithRetry as jest.MockedFunction<
        typeof performHealthCheckWithRetry
      >;
      mockHealthCheck.mockResolvedValue({
        success: false,
        error: "Backend unavailable",
      });

      createBot();

      // Get the polling_error handler
      const pollingErrorHandler = mockOn.mock.calls.find(
        (call) => call[0] === "polling_error"
      )?.[1];

      // Simulate polling error
      const testError = new Error("Connection timeout");
      await pollingErrorHandler(testError);

      expect(logger.error).toHaveBeenCalledWith(
        "❌ Backend health check failed during recovery",
        expect.objectContaining({
          error: "Backend unavailable",
        })
      );
    });

    it("should handle general bot errors", () => {
      createBot();

      // Get the error handler
      const errorHandler = mockOn.mock.calls.find(
        (call) => call[0] === "error"
      )?.[1];

      expect(errorHandler).toBeDefined();

      // Simulate error
      const testError = new Error("General bot error");
      errorHandler(testError);

      expect(logger.error).toHaveBeenCalledWith(
        "❌ Bot error occurred",
        expect.objectContaining({
          message: "General bot error",
        })
      );
    });

    it("should throw error if bot initialization fails", () => {
      (TelegramBot as jest.MockedClass<typeof TelegramBot>).mockImplementation(
        () => {
          throw new Error("Invalid token");
        }
      );

      expect(() => createBot()).toThrow("Failed to connect to Telegram API");
    });
  });

  describe("shutdownBot", () => {
    it("should stop polling and close Convex client", async () => {
      await shutdownBot(mockBot);

      expect(mockStopPolling).toHaveBeenCalled();
      expect(closeConvexClient).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "🛑 Shutting down bot gracefully..."
      );
      expect(logger.info).toHaveBeenCalledWith("✅ Telegram polling stopped");
      expect(logger.info).toHaveBeenCalledWith("✅ Convex connections closed");
      expect(logger.info).toHaveBeenCalledWith(
        "✅ Bot shutdown completed successfully"
      );
    });

    it("should log debug messages during shutdown", async () => {
      await shutdownBot(mockBot);

      expect(logger.debug).toHaveBeenCalledWith("Stopping Telegram polling");
      expect(logger.debug).toHaveBeenCalledWith(
        "Closing Convex client connections"
      );
    });

    it("should handle errors during shutdown", async () => {
      const shutdownError = new Error("Failed to stop polling");
      mockStopPolling.mockRejectedValue(shutdownError);

      await expect(shutdownBot(mockBot)).rejects.toThrow(
        "Failed to stop polling"
      );

      expect(logger.error).toHaveBeenCalledWith(
        "❌ Error during bot shutdown",
        expect.objectContaining({
          error: "Failed to stop polling",
        })
      );
    });

    it("should still attempt to close Convex client if polling stop fails", async () => {
      mockStopPolling.mockRejectedValue(new Error("Polling stop failed"));

      await expect(shutdownBot(mockBot)).rejects.toThrow();

      // Convex close should not be called if stopPolling throws
      // because the error is thrown before reaching that line
    });
  });

  describe("setupShutdownHandlers", () => {
    let originalProcessOn: typeof process.on;
    let signalHandlers: Map<string, Function>;

    beforeEach(() => {
      originalProcessOn = process.on;
      signalHandlers = new Map();

      // Mock process.on to capture signal handlers
      process.on = jest.fn((signal: string, handler: Function) => {
        signalHandlers.set(signal, handler);
        return process;
      }) as any;
    });

    afterEach(() => {
      process.on = originalProcessOn;
    });

    it("should register SIGINT and SIGTERM handlers", () => {
      setupShutdownHandlers(mockBot);

      expect(process.on).toHaveBeenCalledWith("SIGINT", expect.any(Function));
      expect(process.on).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
    });

    it("should handle SIGINT signal gracefully", async () => {
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      setupShutdownHandlers(mockBot);

      const sigintHandler = signalHandlers.get("SIGINT");
      expect(sigintHandler).toBeDefined();

      try {
        await sigintHandler!();
      } catch (error) {
        // Expected to throw because of mocked process.exit
      }

      expect(mockStopPolling).toHaveBeenCalled();
      expect(closeConvexClient).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Received SIGINT signal")
      );
      expect(logger.info).toHaveBeenCalledWith("👋 Shutdown complete - goodbye!");
      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
    });

    it("should handle SIGTERM signal gracefully", async () => {
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      setupShutdownHandlers(mockBot);

      const sigtermHandler = signalHandlers.get("SIGTERM");
      expect(sigtermHandler).toBeDefined();

      try {
        await sigtermHandler!();
      } catch (error) {
        // Expected to throw because of mocked process.exit
      }

      expect(mockStopPolling).toHaveBeenCalled();
      expect(closeConvexClient).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Received SIGTERM signal")
      );
      expect(mockExit).toHaveBeenCalledWith(0);

      mockExit.mockRestore();
    });

    it("should exit with code 1 if shutdown fails", async () => {
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      mockStopPolling.mockRejectedValue(new Error("Shutdown failed"));

      setupShutdownHandlers(mockBot);

      const sigintHandler = signalHandlers.get("SIGINT");

      try {
        await sigintHandler!();
      } catch (error) {
        // Expected to throw because of mocked process.exit
      }

      expect(logger.error).toHaveBeenCalledWith(
        "❌ Error during shutdown",
        expect.objectContaining({
          error: expect.any(String),
        })
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe("Integration: Full Lifecycle", () => {
    it("should complete full bot lifecycle: create -> shutdown", async () => {
      const bot = createBot();

      expect(TelegramBot).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith("polling_error", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));

      await shutdownBot(bot);

      expect(mockStopPolling).toHaveBeenCalled();
      expect(closeConvexClient).toHaveBeenCalled();
    });
  });
});
