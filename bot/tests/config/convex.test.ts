/**
 * Unit tests for Convex client configuration
 */

describe("Convex Client Configuration", () => {
  // Store original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    jest.resetModules();
    // Create a copy of env vars
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original env vars
    process.env = originalEnv;
  });

  describe("URL Validation", () => {
    it("should accept valid HTTPS URL", () => {
      process.env.CONVEX_URL = "https://happy-animal-123.convex.cloud";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error"; // Suppress logs during tests

      expect(() => {
        const { config } = require("../../src/config/env");
        expect(config.convexUrl).toBe("https://happy-animal-123.convex.cloud");
      }).not.toThrow();
    });

    it("should reject HTTP URL (non-HTTPS)", () => {
      process.env.CONVEX_URL = "http://insecure-url.com";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";

      expect(() => {
        require("../../src/config/env");
      }).toThrow("CONVEX_URL must be a valid HTTPS URL");
    });

    it("should reject missing CONVEX_URL", () => {
      delete process.env.CONVEX_URL;
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";

      expect(() => {
        require("../../src/config/env");
      }).toThrow("Missing required environment variable: CONVEX_URL");
    });

    it("should reject empty CONVEX_URL", () => {
      process.env.CONVEX_URL = "";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";

      expect(() => {
        require("../../src/config/env");
      }).toThrow("Missing required environment variable: CONVEX_URL");
    });
  });

  describe("Convex Client Initialization", () => {
    beforeEach(() => {
      process.env.CONVEX_URL = "https://test-deployment.convex.cloud";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";
    });

    it("should initialize Convex client with valid URL", () => {
      const { convexClient } = require("../../src/config/convex");
      expect(convexClient).toBeDefined();
      expect(convexClient).toHaveProperty("query");
    });

    it("should mask URL in logs", () => {
      const { getMaskedConvexUrl } = require("../../src/config/convex");
      const maskedUrl = getMaskedConvexUrl();
      
      expect(maskedUrl).toContain("https://");
      expect(maskedUrl).toContain("***");
      expect(maskedUrl).not.toContain("test-deployment");
    });

    it("should throw error for invalid URL format in client manager", () => {
      // This tests the ConvexClientManager validation
      process.env.CONVEX_URL = "not-a-url";
      
      expect(() => {
        require("../../src/config/convex");
      }).toThrow();
    });
  });

  describe("Singleton Pattern", () => {
    beforeEach(() => {
      process.env.CONVEX_URL = "https://test-deployment.convex.cloud";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";
    });

    it("should return same client instance on multiple imports", () => {
      const { convexClient: client1 } = require("../../src/config/convex");
      const { convexClient: client2 } = require("../../src/config/convex");
      
      expect(client1).toBe(client2);
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      // Clear all cached modules to ensure clean state
      jest.resetModules();
      jest.clearAllMocks();
    });

    it("should provide clear error message for missing URL", () => {
      delete process.env.CONVEX_URL;
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";

      expect(() => {
        require("../../src/config/env");
      }).toThrow(/Missing required environment variable: CONVEX_URL/);
    });

    it("should provide clear error message for invalid URL protocol", () => {
      process.env.CONVEX_URL = "ftp://invalid-protocol.com";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";

      expect(() => {
        require("../../src/config/env");
      }).toThrow(/CONVEX_URL must be a valid HTTPS URL/);
    });
  });

  describe("Client Lifecycle Management", () => {
    beforeEach(() => {
      process.env.CONVEX_URL = "https://test-deployment.convex.cloud";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";
    });

    it("should close Convex client successfully", () => {
      const { convexClient, closeConvexClient } = require("../../src/config/convex");
      
      // Ensure client is initialized
      expect(convexClient).toBeDefined();
      
      // Close should not throw
      expect(() => closeConvexClient()).not.toThrow();
    });

    it("should handle multiple close calls gracefully", () => {
      const { closeConvexClient } = require("../../src/config/convex");
      
      // First close
      expect(() => closeConvexClient()).not.toThrow();
      
      // Second close should also not throw
      expect(() => closeConvexClient()).not.toThrow();
    });

    it("should allow client reinitialization after close", () => {
      jest.resetModules();
      process.env.CONVEX_URL = "https://test-deployment.convex.cloud";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";

      const { convexClient: client1, closeConvexClient } = require("../../src/config/convex");
      expect(client1).toBeDefined();
      
      closeConvexClient();
      
      // After closing, reimport should create new client
      jest.resetModules();
      process.env.CONVEX_URL = "https://test-deployment.convex.cloud";
      process.env.TELEGRAM_BOT_TOKEN = "test_token";
      process.env.LOG_LEVEL = "error";
      
      const { convexClient: client2 } = require("../../src/config/convex");
      expect(client2).toBeDefined();
    });
  });
});
