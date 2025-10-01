/**
 * Mock for Convex generated API
 * Used in tests to avoid requiring actual Convex generated files
 */

export const api = {
  users: {
    createOrGetUser: "users:createOrGetUser",
    getUserByTelegramId: "users:getUserByTelegramId",
  },
  system: {
    getSystemStatus: "system:getSystemStatus",
  },
};
