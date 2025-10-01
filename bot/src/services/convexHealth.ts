import { convexClient, getMaskedConvexUrl } from "../config/convex";
import logger from "../utils/logger";
import { classifyConvexError, ConvexErrorType } from "../utils/errors";

/**
 * Health check response from Convex backend
 */
interface HealthCheckResponse {
  status: string;
  timestamp: number;
  version: string;
  message: string;
}

/**
 * Result of a health check attempt
 */
interface HealthCheckResult {
  success: boolean;
  latency?: number;
  response?: HealthCheckResponse;
  error?: string;
}

/**
 * Performs a single health check against the Convex backend.
 * Measures round-trip latency and returns the result.
 * 
 * @returns Health check result with latency measurement
 */
async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Call Convex health check query
    // Note: This will need to be updated once Convex generates the API types
    // For now, we'll use a direct function call approach
    const response = await convexClient.query(
      "system:getSystemStatus" as any,
      {}
    );

    const latency = Date.now() - startTime;

    logger.info("Convex health check successful", {
      latency,
      status: response.status,
      version: response.version,
      deploymentUrl: getMaskedConvexUrl(),
    });

    return {
      success: true,
      latency,
      response: response as HealthCheckResponse,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorType = classifyConvexError(error);

    logger.error("Convex health check failed", {
      latency,
      errorType,
      error: error instanceof Error ? error.message : String(error),
      deploymentUrl: getMaskedConvexUrl(),
    });

    return {
      success: false,
      latency,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Performs health check with retry logic.
 * Attempts up to maxAttempts times with exponential backoff.
 * 
 * @param maxAttempts - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay between retries in ms (default: 1000)
 * @returns Final health check result
 */
export async function performHealthCheckWithRetry(
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<HealthCheckResult> {
  logger.info("Starting Convex health check", {
    maxAttempts,
    deploymentUrl: getMaskedConvexUrl(),
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.debug(`Health check attempt ${attempt}/${maxAttempts}`);

    const result = await performHealthCheck();

    if (result.success) {
      logger.info("✅ Convex backend connection established", {
        attempt,
        latency: result.latency,
        status: result.response?.status,
      });
      return result;
    }

    // If this wasn't the last attempt, wait before retrying
    if (attempt < maxAttempts) {
      const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff
      logger.warn(`Health check failed, retrying in ${delay}ms`, {
        attempt,
        error: result.error,
        nextAttempt: attempt + 1,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  logger.error("❌ All Convex health check attempts failed", {
    attempts: maxAttempts,
    deploymentUrl: getMaskedConvexUrl(),
  });

  return {
    success: false,
    error: `Failed to connect to Convex backend after ${maxAttempts} attempts`,
  };
}

/**
 * Performs startup health check and exits process if connection fails.
 * This should be called during bot initialization.
 * 
 * @throws Exits process with code 1 if health check fails
 */
export async function performStartupHealthCheck(): Promise<void> {
  logger.info("🔍 Performing Convex startup health check...");

  const result = await performHealthCheckWithRetry(3, 1000);

  if (!result.success) {
    logger.error("❌ Failed to connect to Convex backend on startup", {
      error: result.error,
      deploymentUrl: getMaskedConvexUrl(),
    });
    logger.error(
      "💡 Troubleshooting tips:",
      {
        tip1: "Verify CONVEX_URL is set correctly in .env file",
        tip2: "Ensure Convex deployment is running (check Convex Dashboard)",
        tip3: "Check network connectivity to Convex servers",
        tip4: "Verify system.ts function is deployed to Convex",
      }
    );
    process.exit(1);
  }

  logger.info("✅ Convex backend is healthy and ready", {
    latency: result.latency,
    version: result.response?.version,
  });
}
