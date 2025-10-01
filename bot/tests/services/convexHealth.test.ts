/**
 * Unit tests for Convex health check service
 */

import { jest } from "@jest/globals";

// Mock dependencies before importing the module
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

describe("Convex Health Check Service", () => {
  let convexClient: any;
  let logger: any;
  let performHealthCheckWithRetry: any;
  let performStartupHealthCheck: any;

  beforeEach(async () => {
    // Reset modules to get fresh imports
    jest.clearAllMocks();

    // Import mocked dependencies
    const convexModule = await import("../../src/config/convex");
    const loggerModule = await import("../../src/utils/logger");
    const healthModule = await import("../../src/services/convexHealth");

    convexClient = convexModule.convexClient;
    logger = loggerModule.default;
    performHealthCheckWithRetry = healthModule.performHealthCheckWithRetry;
    performStartupHealthCheck = healthModule.performStartupHealthCheck;
  });

  describe("performHealthCheckWithRetry", () => {
    it("should succeed on first attempt with valid response", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await performHealthCheckWithRetry(3, 100);

      expect(result.success).toBe(true);
      expect(result.latency).toBeGreaterThan(0);
      expect(result.response).toEqual(mockResponse);
      expect(convexClient.query).toHaveBeenCalledTimes(1);
    });

    it("should measure round-trip latency", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 50);
          })
      );

      const result = await performHealthCheckWithRetry(3, 100);

      expect(result.success).toBe(true);
      expect(result.latency).toBeGreaterThanOrEqual(50);
      expect(result.latency).toBeLessThan(200);
    });

    it("should retry on failure and succeed on second attempt", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockResponse);

      const result = await performHealthCheckWithRetry(3, 100);

      expect(result.success).toBe(true);
      expect(convexClient.query).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should fail after max retry attempts", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue(
        new Error("Connection refused")
      );

      const result = await performHealthCheckWithRetry(3, 100);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to connect to Convex backend");
      expect(convexClient.query).toHaveBeenCalledTimes(3);
    });

    it("should use exponential backoff between retries", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue(
        new Error("Timeout")
      );

      const startTime = Date.now();
      await performHealthCheckWithRetry(3, 100);
      const duration = Date.now() - startTime;

      // With exponential backoff: 100ms + 200ms = 300ms minimum
      // (plus query execution time)
      expect(duration).toBeGreaterThanOrEqual(300);
    });

    it("should log successful connection", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await performHealthCheckWithRetry(3, 100);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Convex backend connection established"),
        expect.any(Object)
      );
    });

    it("should log all failed attempts", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue(
        new Error("Connection error")
      );

      await performHealthCheckWithRetry(3, 100);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Convex health check failed"),
        expect.any(Object)
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("All Convex health check attempts failed"),
        expect.any(Object)
      );
    });
  });

  describe("performStartupHealthCheck", () => {
    // Store original process.exit
    const originalExit = process.exit;

    beforeEach(() => {
      // Mock process.exit to prevent test from exiting
      process.exit = jest.fn() as any;
    });

    afterEach(() => {
      // Restore original process.exit
      process.exit = originalExit;
    });

    it("should complete successfully when health check passes", async () => {
      const mockResponse = {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };

      (convexClient.query as jest.Mock).mockResolvedValueOnce(mockResponse);

      await performStartupHealthCheck();

      expect(process.exit).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Convex backend is healthy and ready"),
        expect.any(Object)
      );
    });

    it("should exit process when health check fails", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue(
        new Error("Connection failed")
      );

      await performStartupHealthCheck();

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to connect to Convex backend on startup"),
        expect.any(Object)
      );
    });

    it("should log troubleshooting tips on failure", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue(
        new Error("Timeout")
      );

      await performStartupHealthCheck();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Troubleshooting tips"),
        expect.objectContaining({
          tip1: expect.any(String),
          tip2: expect.any(String),
          tip3: expect.any(String),
          tip4: expect.any(String),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle non-Error exceptions gracefully", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue("String error");

      const result = await performHealthCheckWithRetry(1, 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe("String error");
    });

    it("should include masked URL in error logs", async () => {
      (convexClient.query as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await performHealthCheckWithRetry(1, 100);

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          deploymentUrl: "https://***-***.convex.cloud",
        })
      );
    });
  });
});
