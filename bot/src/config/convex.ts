import { ConvexHttpClient } from "convex/browser";
import { config } from "./env";
import logger from "../utils/logger";

/**
 * Convex client instance for calling Convex serverless functions.
 * Configured with deployment URL from environment variables.
 */
class ConvexClientManager {
  private client: ConvexHttpClient | null = null;
  private readonly deploymentUrl: string;

  constructor(deploymentUrl: string) {
    this.deploymentUrl = deploymentUrl;
    this.validateUrl();
  }

  /**
   * Validates that the Convex URL is properly formatted.
   * @throws Error if URL is invalid
   */
  private validateUrl(): void {
    if (!this.deploymentUrl) {
      throw new Error(
        "CONVEX_URL environment variable is required. " +
          "Please set it in your .env file."
      );
    }

    if (!this.deploymentUrl.startsWith("https://")) {
      throw new Error(
        "CONVEX_URL must be a valid HTTPS URL. " +
          `Received: ${this.maskUrl(this.deploymentUrl)}`
      );
    }

    logger.debug("Convex URL validated successfully", {
      maskedUrl: this.maskUrl(this.deploymentUrl),
    });
  }

  /**
   * Masks sensitive parts of the Convex URL for logging.
   * Example: https://happy-animal-123.convex.cloud -> https://***-***-123.convex.cloud
   */
  private maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostParts = urlObj.hostname.split(".");
      if (hostParts.length >= 3) {
        // Mask subdomain parts except the last segment before domain
        const masked = hostParts
          .map((part, index) => (index < hostParts.length - 2 ? "***" : part))
          .join(".");
        return `${urlObj.protocol}//${masked}`;
      }
      return url;
    } catch {
      return "***";
    }
  }

  /**
   * Gets or creates the Convex client instance.
   * Lazy initialization ensures client is only created when needed.
   */
  public getClient(): ConvexHttpClient {
    if (!this.client) {
      try {
        this.client = new ConvexHttpClient(this.deploymentUrl);
        logger.info("Convex client initialized successfully", {
          deploymentUrl: this.maskUrl(this.deploymentUrl),
        });
      } catch (error) {
        logger.error("Failed to initialize Convex client", {
          error: error instanceof Error ? error.message : String(error),
          deploymentUrl: this.maskUrl(this.deploymentUrl),
        });
        throw new Error(
          `Failed to initialize Convex client: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
    return this.client;
  }

  /**
   * Gets the masked deployment URL for safe logging.
   */
  public getMaskedUrl(): string {
    return this.maskUrl(this.deploymentUrl);
  }

  /**
   * Resets the Convex client instance.
   * Note: ConvexHttpClient doesn't require explicit cleanup as it's stateless.
   * This method is provided for testing purposes to reset the singleton.
   */
  public close(): void {
    if (this.client) {
      logger.debug("Resetting Convex client instance");
      this.client = null;
      logger.debug("Convex client instance reset");
    }
  }
}

// Create singleton instance
const convexManager = new ConvexClientManager(config.convexUrl);

/**
 * Convex HTTP client for calling Convex functions.
 * Use this client to call queries, mutations, and actions.
 * 
 * @example
 * import { convexClient } from "@/config/convex";
 * import { api } from "../../../convex/_generated/api";
 * 
 * const result = await convexClient.query(api.system.getSystemStatus);
 */
export const convexClient = convexManager.getClient();

/**
 * Get the masked Convex deployment URL for logging purposes.
 */
export const getMaskedConvexUrl = (): string => convexManager.getMaskedUrl();

/**
 * Close the Convex client and clean up resources.
 * Should be called during graceful shutdown.
 */
export const closeConvexClient = (): void => convexManager.close();
