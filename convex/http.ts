import { httpRouter } from "convex/server";
import { webhookHandler, healthCheck } from "./telegram";

const http = httpRouter();

// Telegram webhook endpoint
http.route({
  path: "/telegram/webhookHandler",
  method: "POST",
  handler: webhookHandler,
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: healthCheck,
});

export default http;
