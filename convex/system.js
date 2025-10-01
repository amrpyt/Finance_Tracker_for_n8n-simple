// System health check query (JavaScript version for Docker Convex compatibility)
import { query } from "./_generated/server";

export const getSystemStatus = query({
  args: {},
  handler: async () => {
    return {
      status: "healthy",
      timestamp: Date.now(),
      version: "1.0.0",
      message: "Convex backend is operational",
    };
  },
});
