// Simple system health check query (JavaScript version for Docker Convex)
// This version doesn't require TypeScript compilation

export default {
  getSystemStatus: {
    args: {},
    handler: async () => {
      return {
        status: "healthy",
        timestamp: Date.now(),
        version: "1.0.0",
        message: "Convex backend is operational",
      };
    },
  },
};
