import {
  getWelcomeMessage,
  getHelpMessage,
  WELCOME_MESSAGES,
  HELP_MESSAGE,
} from "../../src/utils/messages";

describe("Message Templates", () => {
  describe("WELCOME_MESSAGES", () => {
    it("should have new user messages in both languages", () => {
      expect(WELCOME_MESSAGES.newUser.en).toBeDefined();
      expect(WELCOME_MESSAGES.newUser.ar).toBeDefined();
      expect(WELCOME_MESSAGES.newUser.en.length).toBeGreaterThan(0);
      expect(WELCOME_MESSAGES.newUser.ar.length).toBeGreaterThan(0);
    });

    it("should have returning user messages in both languages", () => {
      expect(WELCOME_MESSAGES.returningUser.en).toBeDefined();
      expect(WELCOME_MESSAGES.returningUser.ar).toBeDefined();
      expect(WELCOME_MESSAGES.returningUser.en.length).toBeGreaterThan(0);
      expect(WELCOME_MESSAGES.returningUser.ar.length).toBeGreaterThan(0);
    });

    it("should contain firstName placeholder in new user messages", () => {
      expect(WELCOME_MESSAGES.newUser.en).toContain("{firstName}");
      expect(WELCOME_MESSAGES.newUser.ar).toContain("{firstName}");
    });

    it("should contain firstName placeholder in returning user messages", () => {
      expect(WELCOME_MESSAGES.returningUser.en).toContain("{firstName}");
      expect(WELCOME_MESSAGES.returningUser.ar).toContain("{firstName}");
    });

    it("should contain emoji for visual clarity", () => {
      // Check for at least one emoji in each message
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
      expect(emojiRegex.test(WELCOME_MESSAGES.newUser.en)).toBe(true);
      expect(emojiRegex.test(WELCOME_MESSAGES.newUser.ar)).toBe(true);
      expect(emojiRegex.test(WELCOME_MESSAGES.returningUser.en)).toBe(true);
      expect(emojiRegex.test(WELCOME_MESSAGES.returningUser.ar)).toBe(true);
    });

    it("should contain example commands in new user messages", () => {
      // English examples
      expect(WELCOME_MESSAGES.newUser.en).toContain("paid 50 for coffee");
      expect(WELCOME_MESSAGES.newUser.en).toContain("received 5000 salary");
      expect(WELCOME_MESSAGES.newUser.en).toContain("lent Ahmed 200");

      // Arabic examples
      expect(WELCOME_MESSAGES.newUser.ar).toContain("دفعت 50 على القهوة");
      expect(WELCOME_MESSAGES.newUser.ar).toContain("استلمت 5000 راتب");
      expect(WELCOME_MESSAGES.newUser.ar).toContain("أقرضت أحمد 200");
    });

    it("should be under 300 words for mobile viewing", () => {
      const countWords = (text: string) => {
        return text.split(/\s+/).filter((word) => word.length > 0).length;
      };

      expect(countWords(WELCOME_MESSAGES.newUser.en)).toBeLessThan(300);
      expect(countWords(WELCOME_MESSAGES.newUser.ar)).toBeLessThan(300);
      expect(countWords(WELCOME_MESSAGES.returningUser.en)).toBeLessThan(300);
      expect(countWords(WELCOME_MESSAGES.returningUser.ar)).toBeLessThan(300);
    });

    it("should contain Telegram markdown formatting", () => {
      // Check for bold (*text*) or italic (_text_)
      const markdownRegex = /\*[^*]+\*|_[^_]+_/;
      expect(markdownRegex.test(WELCOME_MESSAGES.newUser.en)).toBe(true);
      expect(markdownRegex.test(WELCOME_MESSAGES.newUser.ar)).toBe(true);
      expect(markdownRegex.test(WELCOME_MESSAGES.returningUser.en)).toBe(true);
      expect(markdownRegex.test(WELCOME_MESSAGES.returningUser.ar)).toBe(true);
    });
  });

  describe("HELP_MESSAGE", () => {
    it("should have messages in both languages", () => {
      expect(HELP_MESSAGE.en).toBeDefined();
      expect(HELP_MESSAGE.ar).toBeDefined();
      expect(HELP_MESSAGE.en.length).toBeGreaterThan(0);
      expect(HELP_MESSAGE.ar.length).toBeGreaterThan(0);
    });

    it("should contain emoji for visual clarity", () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
      expect(emojiRegex.test(HELP_MESSAGE.en)).toBe(true);
      expect(emojiRegex.test(HELP_MESSAGE.ar)).toBe(true);
    });

    it("should contain command references", () => {
      // Check for basic commands
      expect(HELP_MESSAGE.en).toContain("/start");
      expect(HELP_MESSAGE.en).toContain("/help");
      expect(HELP_MESSAGE.en).toContain("/status");

      expect(HELP_MESSAGE.ar).toContain("/start");
      expect(HELP_MESSAGE.ar).toContain("/help");
      expect(HELP_MESSAGE.ar).toContain("/status");
    });

    it("should contain usage examples", () => {
      // English examples
      expect(HELP_MESSAGE.en).toContain("paid");
      expect(HELP_MESSAGE.en).toContain("received");
      expect(HELP_MESSAGE.en).toContain("lent");

      // Arabic examples
      expect(HELP_MESSAGE.ar).toContain("دفعت");
      expect(HELP_MESSAGE.ar).toContain("استلمت");
      expect(HELP_MESSAGE.ar).toContain("أقرضت");
    });

    it("should contain Telegram markdown formatting", () => {
      const markdownRegex = /\*[^*]+\*|_[^_]+_/;
      expect(markdownRegex.test(HELP_MESSAGE.en)).toBe(true);
      expect(markdownRegex.test(HELP_MESSAGE.ar)).toBe(true);
    });

    it("should be under 300 words for mobile viewing", () => {
      const countWords = (text: string) => {
        return text.split(/\s+/).filter((word) => word.length > 0).length;
      };

      expect(countWords(HELP_MESSAGE.en)).toBeLessThan(300);
      expect(countWords(HELP_MESSAGE.ar)).toBeLessThan(300);
    });
  });

  describe("getWelcomeMessage", () => {
    it("should return English new user message with firstName replaced", () => {
      const message = getWelcomeMessage("John", true, "en");
      expect(message).toContain("John");
      expect(message).not.toContain("{firstName}");
      expect(message).toContain("Welcome, John!");
    });

    it("should return Arabic new user message with firstName replaced", () => {
      const message = getWelcomeMessage("أحمد", true, "ar");
      expect(message).toContain("أحمد");
      expect(message).not.toContain("{firstName}");
      expect(message).toContain("أهلاً، أحمد!");
    });

    it("should return English returning user message with firstName replaced", () => {
      const message = getWelcomeMessage("Sarah", false, "en");
      expect(message).toContain("Sarah");
      expect(message).not.toContain("{firstName}");
      expect(message).toContain("Welcome back, Sarah!");
    });

    it("should return Arabic returning user message with firstName replaced", () => {
      const message = getWelcomeMessage("فاطمة", false, "ar");
      expect(message).toContain("فاطمة");
      expect(message).not.toContain("{firstName}");
      expect(message).toContain("مرحباً بعودتك، فاطمة!");
    });

    it("should default to English if language not specified", () => {
      const message = getWelcomeMessage("Alex", true);
      expect(message).toContain("Welcome, Alex!");
      expect(message).not.toContain("أهلاً");
    });

    it("should handle special characters in firstName", () => {
      const message = getWelcomeMessage("O'Brien", true, "en");
      expect(message).toContain("O'Brien");
      expect(message).not.toContain("{firstName}");
    });
  });

  describe("getHelpMessage", () => {
    it("should return English help message", () => {
      const message = getHelpMessage("en");
      expect(message).toBe(HELP_MESSAGE.en);
      expect(message).toContain("Finance Tracker Bot - Help");
    });

    it("should return Arabic help message", () => {
      const message = getHelpMessage("ar");
      expect(message).toBe(HELP_MESSAGE.ar);
      expect(message).toContain("بوت تتبع المالية - مساعدة");
    });

    it("should default to English if language not specified", () => {
      const message = getHelpMessage();
      expect(message).toBe(HELP_MESSAGE.en);
    });
  });
});
