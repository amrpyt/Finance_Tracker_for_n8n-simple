import {
  getWelcomeMessage,
  getHelpMessage,
  WELCOME_MESSAGES,
  HELP_MESSAGE,
  ACCOUNT_LIST_MESSAGES,
  getAccountListHeader,
  getEmptyAccountsMessage,
  getTotalBalanceMessage,
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

  describe("ACCOUNT_LIST_MESSAGES", () => {
    it("should have header messages in both languages", () => {
      expect(ACCOUNT_LIST_MESSAGES.header.en).toBeDefined();
      expect(ACCOUNT_LIST_MESSAGES.header.ar).toBeDefined();
      expect(ACCOUNT_LIST_MESSAGES.header.en).toContain("Your Accounts");
      expect(ACCOUNT_LIST_MESSAGES.header.ar).toContain("حساباتك");
    });

    it("should have empty state messages in both languages", () => {
      expect(ACCOUNT_LIST_MESSAGES.empty.en).toBeDefined();
      expect(ACCOUNT_LIST_MESSAGES.empty.ar).toBeDefined();
      expect(ACCOUNT_LIST_MESSAGES.empty.en).toContain("don't have any accounts");
      expect(ACCOUNT_LIST_MESSAGES.empty.ar).toContain("ليس لديك أي حسابات");
    });

    it("should have total balance messages in both languages", () => {
      expect(ACCOUNT_LIST_MESSAGES.totalBalance.en).toBeDefined();
      expect(ACCOUNT_LIST_MESSAGES.totalBalance.ar).toBeDefined();
      expect(ACCOUNT_LIST_MESSAGES.totalBalance.en).toContain("Total Balance");
      expect(ACCOUNT_LIST_MESSAGES.totalBalance.ar).toContain("الرصيد الإجمالي");
    });

    it("should contain emoji in messages", () => {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
      expect(emojiRegex.test(ACCOUNT_LIST_MESSAGES.header.en)).toBe(true);
      expect(emojiRegex.test(ACCOUNT_LIST_MESSAGES.header.ar)).toBe(true);
      expect(emojiRegex.test(ACCOUNT_LIST_MESSAGES.empty.en)).toBe(true);
      expect(emojiRegex.test(ACCOUNT_LIST_MESSAGES.empty.ar)).toBe(true);
    });
  });

  describe("getAccountListHeader", () => {
    it("should return English header", () => {
      const header = getAccountListHeader("en");
      expect(header).toBe(ACCOUNT_LIST_MESSAGES.header.en);
      expect(header).toContain("Your Accounts");
    });

    it("should return Arabic header", () => {
      const header = getAccountListHeader("ar");
      expect(header).toBe(ACCOUNT_LIST_MESSAGES.header.ar);
      expect(header).toContain("حساباتك");
    });

    it("should default to English if language not specified", () => {
      const header = getAccountListHeader();
      expect(header).toBe(ACCOUNT_LIST_MESSAGES.header.en);
    });
  });

  describe("getEmptyAccountsMessage", () => {
    it("should return English empty message", () => {
      const message = getEmptyAccountsMessage("en");
      expect(message).toBe(ACCOUNT_LIST_MESSAGES.empty.en);
      expect(message).toContain("create account");
    });

    it("should return Arabic empty message", () => {
      const message = getEmptyAccountsMessage("ar");
      expect(message).toBe(ACCOUNT_LIST_MESSAGES.empty.ar);
      expect(message).toContain("إنشاء حساب");
    });

    it("should default to English if language not specified", () => {
      const message = getEmptyAccountsMessage();
      expect(message).toBe(ACCOUNT_LIST_MESSAGES.empty.en);
    });
  });

  describe("getTotalBalanceMessage", () => {
    it("should return English total balance message with formatted amount", () => {
      const message = getTotalBalanceMessage(5000, "en");
      expect(message).toContain("Total Balance");
      expect(message).toContain("5000.00");
      expect(message).toContain("EGP");
    });

    it("should return Arabic total balance message with formatted amount", () => {
      const message = getTotalBalanceMessage(5000, "ar");
      expect(message).toContain("الرصيد الإجمالي");
      expect(message).toContain("5000.00");
      expect(message).toContain("جنيه");
    });

    it("should format decimal places correctly", () => {
      const message = getTotalBalanceMessage(1234.5, "en");
      expect(message).toContain("1234.50");
    });

    it("should handle zero balance", () => {
      const message = getTotalBalanceMessage(0, "en");
      expect(message).toContain("0.00");
    });

    it("should handle negative balance", () => {
      const message = getTotalBalanceMessage(-500, "en");
      expect(message).toContain("-500.00");
    });

    it("should default to English if language not specified", () => {
      const message = getTotalBalanceMessage(1000);
      expect(message).toContain("Total Balance");
    });
  });
});
