import {
  getAccountTypeEmoji,
  getAccountTypeName,
  formatAccountConfirmation,
  parseAccountType,
  parseBalance,
  formatAccountsList,
} from "../../src/utils/accountHelpers";

describe("Account Helpers", () => {
  describe("getAccountTypeEmoji", () => {
    it("should return bank emoji for bank type", () => {
      expect(getAccountTypeEmoji("bank")).toBe("🏦");
    });

    it("should return cash emoji for cash type", () => {
      expect(getAccountTypeEmoji("cash")).toBe("💵");
    });

    it("should return credit emoji for credit type", () => {
      expect(getAccountTypeEmoji("credit")).toBe("💳");
    });

    it("should return default emoji for unknown type", () => {
      expect(getAccountTypeEmoji("unknown")).toBe("💰");
    });
  });

  describe("getAccountTypeName", () => {
    it("should return English names for account types", () => {
      expect(getAccountTypeName("bank", "en")).toBe("Bank");
      expect(getAccountTypeName("cash", "en")).toBe("Cash");
      expect(getAccountTypeName("credit", "en")).toBe("Credit");
    });

    it("should return Arabic names for account types", () => {
      expect(getAccountTypeName("bank", "ar")).toBe("بنك");
      expect(getAccountTypeName("cash", "ar")).toBe("نقد");
      expect(getAccountTypeName("credit", "ar")).toBe("ائتمان");
    });

    it("should default to English if language not specified", () => {
      expect(getAccountTypeName("bank")).toBe("Bank");
    });

    it("should return original type for unknown types", () => {
      expect(getAccountTypeName("unknown", "en")).toBe("unknown");
    });
  });

  describe("formatAccountConfirmation", () => {
    const testAccount = {
      name: "Main Bank",
      type: "bank",
      balance: 5000,
      currency: "EGP",
    };

    it("should format confirmation in English", () => {
      const message = formatAccountConfirmation(testAccount, "en");
      expect(message).toContain("Account Created Successfully!");
      expect(message).toContain("🏦");
      expect(message).toContain("Main Bank");
      expect(message).toContain("Bank");
      expect(message).toContain("5000");
      expect(message).toContain("EGP");
    });

    it("should format confirmation in Arabic", () => {
      const message = formatAccountConfirmation(testAccount, "ar");
      expect(message).toContain("تم إنشاء الحساب بنجاح!");
      expect(message).toContain("🏦");
      expect(message).toContain("Main Bank");
      expect(message).toContain("بنك");
      expect(message).toContain("5000");
      expect(message).toContain("EGP");
    });

    it("should use correct emoji for each account type", () => {
      const cashAccount = { ...testAccount, type: "cash" };
      const creditAccount = { ...testAccount, type: "credit" };

      expect(formatAccountConfirmation(cashAccount, "en")).toContain("💵");
      expect(formatAccountConfirmation(creditAccount, "en")).toContain("💳");
    });
  });

  describe("parseAccountType", () => {
    it("should parse English bank keywords", () => {
      expect(parseAccountType("bank")).toBe("bank");
      expect(parseAccountType("Bank")).toBe("bank");
      expect(parseAccountType("BANK")).toBe("bank");
    });

    it("should parse English cash keywords", () => {
      expect(parseAccountType("cash")).toBe("cash");
      expect(parseAccountType("Cash")).toBe("cash");
    });

    it("should parse English credit keywords", () => {
      expect(parseAccountType("credit")).toBe("credit");
      expect(parseAccountType("Credit")).toBe("credit");
    });

    it("should parse Arabic bank keywords", () => {
      expect(parseAccountType("بنك")).toBe("bank");
    });

    it("should parse Arabic cash keywords", () => {
      expect(parseAccountType("نقد")).toBe("cash");
    });

    it("should parse Arabic credit keywords", () => {
      expect(parseAccountType("ائتمان")).toBe("credit");
      expect(parseAccountType("إئتمان")).toBe("credit");
    });

    it("should return null for unrecognized input", () => {
      expect(parseAccountType("unknown")).toBeNull();
      expect(parseAccountType("xyz")).toBeNull();
      expect(parseAccountType("")).toBeNull();
    });
  });

  describe("parseBalance", () => {
    it("should parse valid numbers", () => {
      expect(parseBalance("5000")).toBe(5000);
      expect(parseBalance("100.50")).toBe(100.5);
      expect(parseBalance("0")).toBe(0);
    });

    it("should parse numbers with commas", () => {
      expect(parseBalance("1,000")).toBe(1000);
      expect(parseBalance("10,000.50")).toBe(10000.5);
    });

    it("should handle negative numbers", () => {
      expect(parseBalance("-500")).toBe(-500);
    });

    it("should handle whitespace", () => {
      expect(parseBalance("  5000  ")).toBe(5000);
      expect(parseBalance(" 100.50 ")).toBe(100.5);
    });

    it("should return null for invalid input", () => {
      expect(parseBalance("abc")).toBeNull();
      expect(parseBalance("")).toBeNull();
      expect(parseBalance("not a number")).toBeNull();
    });
  });

  describe("formatAccountsList", () => {
    const mockAccounts = [
      {
        _id: "1",
        name: "Main Bank",
        type: "bank",
        balance: 5000,
        currency: "EGP",
        createdAt: 1000,
      },
      {
        _id: "2",
        name: "Cash Wallet",
        type: "cash",
        balance: 500,
        currency: "EGP",
        createdAt: 2000,
      },
      {
        _id: "3",
        name: "Credit Card",
        type: "credit",
        balance: -1000,
        currency: "EGP",
        createdAt: 1500,
      },
    ];

    it("should format accounts list in English", () => {
      const message = formatAccountsList(mockAccounts, "en");
      expect(message).toContain("🏦 *Main Bank* (Bank): 5000 EGP");
      expect(message).toContain("💵 *Cash Wallet* (Cash): 500 EGP");
      expect(message).toContain("💳 *Credit Card* (Credit): -1000 EGP");
      expect(message).toContain("Total Balance:");
    });

    it("should format accounts list in Arabic", () => {
      const message = formatAccountsList(mockAccounts, "ar");
      expect(message).toContain("🏦 *Main Bank* (بنك): 5000 EGP");
      expect(message).toContain("💵 *Cash Wallet* (نقد): 500 EGP");
      expect(message).toContain("💳 *Credit Card* (ائتمان): -1000 EGP");
      expect(message).toContain("الرصيد الإجمالي:");
    });

    it("should sort accounts by creation date (oldest first)", () => {
      const message = formatAccountsList(mockAccounts, "en");
      const lines = message.split("\n");
      
      // Main Bank (createdAt: 1000) should be first
      expect(lines[0]).toContain("Main Bank");
      // Credit Card (createdAt: 1500) should be second
      expect(lines[1]).toContain("Credit Card");
      // Cash Wallet (createdAt: 2000) should be third
      expect(lines[2]).toContain("Cash Wallet");
    });

    it("should calculate total balance correctly", () => {
      const message = formatAccountsList(mockAccounts, "en");
      // 5000 + 500 + (-1000) = 4500
      expect(message).toContain("4500.00");
    });

    it("should handle single account", () => {
      const singleAccount = [mockAccounts[0]];
      const message = formatAccountsList(singleAccount, "en");
      expect(message).toContain("Main Bank");
      expect(message).toContain("5000.00");
    });

    it("should handle empty array", () => {
      const message = formatAccountsList([], "en");
      expect(message).toContain("0.00");
    });

    it("should format total balance with 2 decimal places", () => {
      const accounts = [
        {
          _id: "1",
          name: "Test",
          type: "bank",
          balance: 100.5,
          currency: "EGP",
          createdAt: 1000,
        },
      ];
      const message = formatAccountsList(accounts, "en");
      expect(message).toContain("100.50");
    });
  });
});
