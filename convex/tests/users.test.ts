import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

describe("users", () => {
  describe("createOrGetUser", () => {
    test("should create new user with correct fields", async () => {
      const t = convexTest(schema);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "123456789",
        username: "testuser",
        firstName: "Ahmed",
        languageCode: "ar",
      });

      expect(result.isNewUser).toBe(true);
      expect(result.user.telegramUserId).toBe("123456789");
      expect(result.user.username).toBe("testuser");
      expect(result.user.firstName).toBe("Ahmed");
      expect(result.user.languagePreference).toBe("ar");
      expect(result.user.createdAt).toBeGreaterThan(0);
    });

    test("should return existing user without duplicating", async () => {
      const t = convexTest(schema);

      // Create user first time
      const firstResult = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "987654321",
        username: "existinguser",
        firstName: "Sara",
        languageCode: "en",
      });

      expect(firstResult.isNewUser).toBe(true);

      // Try to create same user again
      const secondResult = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "987654321",
        username: "existinguser",
        firstName: "Sara",
        languageCode: "en",
      });

      expect(secondResult.isNewUser).toBe(false);
      expect(secondResult.user._id).toBe(firstResult.user._id);
      expect(secondResult.user.telegramUserId).toBe("987654321");
    });

    test("should default language to 'ar' when no languageCode provided", async () => {
      const t = convexTest(schema);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "111222333",
        firstName: "Fatima",
      });

      expect(result.user.languagePreference).toBe("ar");
    });

    test("should set language to 'en' when languageCode is 'en'", async () => {
      const t = convexTest(schema);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "444555666",
        firstName: "John",
        languageCode: "en",
      });

      expect(result.user.languagePreference).toBe("en");
    });

    test("should default to 'ar' for non-English language codes", async () => {
      const t = convexTest(schema);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "777888999",
        firstName: "Pierre",
        languageCode: "fr",
      });

      expect(result.user.languagePreference).toBe("ar");
    });

    test("should throw error for missing telegramUserId", async () => {
      const t = convexTest(schema);

      await expect(
        t.mutation(api.users.createOrGetUser, {
          telegramUserId: "",
          firstName: "Test",
        })
      ).rejects.toThrow();
    });

    test("should throw error for missing firstName", async () => {
      const t = convexTest(schema);

      await expect(
        t.mutation(api.users.createOrGetUser, {
          telegramUserId: "123456",
          firstName: "",
        })
      ).rejects.toThrow();
    });

    test("should trim and sanitize firstName", async () => {
      const t = convexTest(schema);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "555666777",
        firstName: "  Ahmed  ",
      });

      expect(result.user.firstName).toBe("Ahmed");
    });

    test("should truncate firstName longer than 100 characters", async () => {
      const t = convexTest(schema);
      const longName = "A".repeat(150);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "888999000",
        firstName: longName,
      });

      expect(result.user.firstName.length).toBe(100);
    });

    test("should handle optional username field", async () => {
      const t = convexTest(schema);

      const result = await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "123123123",
        firstName: "NoUsername",
      });

      expect(result.user.username).toBeUndefined();
    });

    test("should use index for user lookup (performance test)", async () => {
      const t = convexTest(schema);

      // Create user
      await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "999888777",
        firstName: "Performance",
      });

      // Query should use by_telegram_id index
      const startTime = Date.now();
      const user = await t.query(api.users.getUserByTelegramId, {
        telegramUserId: "999888777",
      });
      const queryTime = Date.now() - startTime;

      expect(user).not.toBeNull();
      expect(user?.telegramUserId).toBe("999888777");
      // Query should be fast (< 100ms in test environment)
      expect(queryTime).toBeLessThan(100);
    });
  });

  describe("getUserByTelegramId", () => {
    test("should return user when found", async () => {
      const t = convexTest(schema);

      await t.mutation(api.users.createOrGetUser, {
        telegramUserId: "111111111",
        firstName: "FindMe",
      });

      const user = await t.query(api.users.getUserByTelegramId, {
        telegramUserId: "111111111",
      });

      expect(user).not.toBeNull();
      expect(user?.firstName).toBe("FindMe");
    });

    test("should return null when user not found", async () => {
      const t = convexTest(schema);

      const user = await t.query(api.users.getUserByTelegramId, {
        telegramUserId: "nonexistent",
      });

      expect(user).toBeNull();
    });
  });
});
