/**
 * Account-related helper functions
 * Formatting and display utilities for accounts
 */

/**
 * Get emoji for account type
 * @param type - Account type: "bank", "cash", or "credit"
 * @returns Emoji representing the account type
 */
export function getAccountTypeEmoji(type: string): string {
  switch (type) {
    case "bank":
      return "🏦";
    case "cash":
      return "💵";
    case "credit":
      return "💳";
    default:
      return "💰";
  }
}

/**
 * Get localized account type name
 * @param type - Account type
 * @param language - User's language preference
 * @returns Localized type name
 */
export function getAccountTypeName(
  type: string,
  language: "en" | "ar" = "en"
): string {
  const typeNames: Record<string, { en: string; ar: string }> = {
    bank: { en: "Bank", ar: "بنك" },
    cash: { en: "Cash", ar: "نقد" },
    credit: { en: "Credit", ar: "ائتمان" },
  };

  return typeNames[type]?.[language] || type;
}

/**
 * Format account confirmation message
 * @param account - Account details
 * @param language - User's language preference
 * @returns Formatted confirmation message
 */
export function formatAccountConfirmation(
  account: {
    name: string;
    type: string;
    balance: number;
    currency: string;
  },
  language: "en" | "ar" = "en"
): string {
  const emoji = getAccountTypeEmoji(account.type);
  const typeName = getAccountTypeName(account.type, language);

  if (language === "ar") {
    return `✅ *تم إنشاء الحساب بنجاح!*

${emoji} *${account.name}*
النوع: ${typeName}
الرصيد: ${account.balance} ${account.currency}
العملة: ${account.currency}

حسابك جاهز للاستخدام! 🎉`;
  }

  return `✅ *Account Created Successfully!*

${emoji} *${account.name}*
Type: ${typeName}
Balance: ${account.balance} ${account.currency}
Currency: ${account.currency}

Your account is ready to use! 🎉`;
}

/**
 * Parse account type from user input (supports English and Arabic)
 * @param input - User's input text
 * @returns Normalized account type or null if not recognized
 */
export function parseAccountType(input: string): "bank" | "cash" | "credit" | null {
  const normalized = input.toLowerCase().trim();

  // English keywords
  if (normalized.includes("bank") || normalized === "bank") return "bank";
  if (normalized.includes("cash") || normalized === "cash") return "cash";
  if (normalized.includes("credit") || normalized === "credit") return "credit";

  // Arabic keywords
  if (normalized.includes("بنك")) return "bank";
  if (normalized.includes("نقد")) return "cash";
  if (normalized.includes("ائتمان") || normalized.includes("إئتمان")) return "credit";

  return null;
}

/**
 * Parse balance from user input
 * @param input - User's input text
 * @returns Parsed balance number or null if invalid
 */
export function parseBalance(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, "");
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Format accounts list with balances
 * @param accounts - Array of account objects
 * @param language - User's language preference
 * @returns Formatted string with account list and total balance
 */
export function formatAccountsList(
  accounts: Array<{
    _id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    createdAt: number;
  }>,
  language: "en" | "ar" = "en"
): string {
  // Sort accounts by creation date (oldest first)
  const sortedAccounts = [...accounts].sort((a, b) => a.createdAt - b.createdAt);

  // Format each account line
  const accountLines = sortedAccounts.map((account) => {
    const emoji = getAccountTypeEmoji(account.type);
    const typeName = getAccountTypeName(account.type, language);
    return `${emoji} *${account.name}* (${typeName}): ${account.balance} ${account.currency}`;
  });

  // Calculate total balance
  const totalBalance = sortedAccounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  // Build complete message
  const accountList = accountLines.join("\n");
  const totalLine =
    language === "ar"
      ? `\n💰 *الرصيد الإجمالي:* ${totalBalance.toFixed(2)} جنيه`
      : `\n💰 *Total Balance:* ${totalBalance.toFixed(2)} EGP`;

  return accountList + totalLine;
}
