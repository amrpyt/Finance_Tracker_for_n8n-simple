/**
 * Message handlers for natural language processing
 * Handles account creation and other conversational flows
 */

import TelegramBot from "node-telegram-bot-api";
import { convexClient } from "../config/convex";
import logger from "../utils/logger";
import { detectUserLanguage, handleConvexError } from "../utils/errors";
import {
  getAccountTypePrompt,
  getAccountNamePrompt,
  getInitialBalancePrompt,
  getAccountListHeader,
  getEmptyAccountsMessage,
  getDefaultAccountConfirmation,
  getAlreadyDefaultMessage,
  getAccountNotFoundMessage,
  getSingleAccountBalanceMessage,
  getMultiAccountBalanceMessage,
  getViewAllAccountsPrompt,
  getBalanceErrorMessage,
} from "../utils/messages";
import {
  parseAccountType,
  parseBalance,
  formatAccountConfirmation,
  formatAccountsList,
  formatAccountBalanceLine,
  getDefaultAccount,
  sortAccountsByCreatedAt,
} from "../utils/accountHelpers";
import { sessionManager } from "../services/session";
import { api } from "../../../convex/_generated/api";

/**
 * Detect if message contains account creation intent
 */
function detectAccountCreationIntent(text: string): boolean {
  const normalized = text.toLowerCase().trim();

  // English keywords
  if (
    normalized.includes("create account") ||
    normalized.includes("new account") ||
    normalized.includes("add account") ||
    normalized.includes("make account")
  ) {
    return true;
  }

  // Arabic keywords
  if (
    normalized.includes("إنشاء حساب") ||
    normalized.includes("انشاء حساب") ||
    normalized.includes("أضف حساب") ||
    normalized.includes("اضف حساب") ||
    normalized.includes("حساب جديد")
  ) {
    return true;
  }

  return false;
}

/**
 * Detect if message contains balance inquiry intent
 */
function detectBalanceIntent(text: string): boolean {
  const normalized = text.toLowerCase().trim();

  // English keywords
  const englishKeywords = [
    "balance",
    "my balance",
    "what's my balance",
    "whats my balance",
    "how much do i have",
    "how much money",
    "account balance",
  ];

  if (englishKeywords.some((keyword) => normalized.includes(keyword))) {
    return true;
  }

  // Arabic keywords
  const arabicKeywords = [
    "رصيدي",
    "ما هو رصيدي",
    "كم رصيدي",
    "الرصيد",
    "كم عندي",
  ];

  if (arabicKeywords.some((keyword) => normalized.includes(keyword))) {
    return true;
  }

  return false;
}

/**
 * Detect if message contains account list intent
 */
function detectAccountListIntent(text: string): boolean {
  const normalized = text.toLowerCase().trim();

  // English keywords
  if (
    normalized.includes("show accounts") ||
    normalized.includes("list accounts") ||
    normalized.includes("view accounts") ||
    normalized.includes("my accounts") ||
    normalized === "accounts"
  ) {
    return true;
  }

  // Arabic keywords
  if (
    normalized.includes("عرض الحسابات") ||
    normalized.includes("الحسابات") ||
    normalized.includes("حساباتي") ||
    normalized.includes("اظهر الحسابات") ||
    normalized.includes("اعرض الحسابات")
  ) {
    return true;
  }

  return false;
}

/**
 * Detect if message contains set default account intent
 * @param text - User's message text
 * @returns Object with detected flag and extracted account name
 */
function detectSetDefaultIntent(text: string): { detected: boolean; accountName: string | null } {
  const normalized = text.toLowerCase().trim();

  // English patterns: "set X as default", "make X default"
  const englishPatterns = [
    /set\s+(.+?)\s+as\s+default/i,
    /make\s+(.+?)\s+default/i,
    /set\s+default\s+to\s+(.+)/i,
  ];

  for (const pattern of englishPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return { detected: true, accountName: match[1].trim() };
    }
  }

  // Arabic patterns: "اجعل X افتراضي", "اجعل X الافتراضي"
  const arabicPatterns = [
    /اجعل\s+(.+?)\s+افتراضي/,
    /اجعل\s+(.+?)\s+الافتراضي/,
    /اجعل\s+(.+?)\s+افتراضياً/,
  ];

  for (const pattern of arabicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return { detected: true, accountName: match[1].trim() };
    }
  }

  return { detected: false, accountName: null };
}

/**
 * Handle account creation intent
 */
async function handleAccountCreationIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string
) {
  const language = detectUserLanguage(msg.text, msg.from?.language_code);

  // Start account creation session
  sessionManager.startAccountCreation(userId);

  // Prompt for account type
  const prompt = getAccountTypePrompt(language);
  await bot.sendMessage(msg.chat.id, prompt, { parse_mode: "Markdown" });

  logger.info("Account creation started", {
    userId,
    chatId: msg.chat.id,
    language,
  });
}

/**
 * Handle balance inquiry intent
 */
async function handleBalanceIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string
) {
  const language = detectUserLanguage(msg.text, msg.from?.language_code);

  try {
    // Get user's Convex ID
    const userResult = await convexClient.query(api.users.getUserByTelegramId, {
      telegramUserId: userId,
    });

    if (!userResult) {
      const errorMsg =
        language === "ar"
          ? "عذراً، لم أتمكن من العثور على حسابك. يرجى استخدام /start للبدء."
          : "Sorry, I couldn't find your account. Please use /start to begin.";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    // Get all user accounts
    const accounts = await convexClient.query(api.accounts.getUserAccounts, {
      userId: userResult._id,
    });

    if (!accounts || accounts.length === 0) {
      const emptyMsg = getEmptyAccountsMessage(language);
      await bot.sendMessage(msg.chat.id, emptyMsg, { parse_mode: "Markdown" });
      logger.info("Account list shown - empty", { userId });
      return;
    }

    // Sort accounts by creation date
    const normalizedAccounts = sortAccountsByCreatedAt(
      accounts.map((account) => ({
        ...account,
        balance: account.balance ?? 0,
        currency: account.currency ?? "EGP",
      }))
    );

    if (normalizedAccounts.length === 1) {
      const account = normalizedAccounts[0];
      const balanceLine = formatAccountBalanceLine(account, language);
      const message = getSingleAccountBalanceMessage(balanceLine, language);

      await bot.sendMessage(msg.chat.id, message, { parse_mode: "Markdown" });

      logger.info("Balance inquiry - single account", {
        userId,
        accountId: account._id,
      });
      return;
    }

    const defaultAccount = getDefaultAccount(normalizedAccounts);

    if (!defaultAccount) {
      const header = getAccountListHeader(language);
      const accountsList = formatAccountsList(normalizedAccounts, language);
      await bot.sendMessage(msg.chat.id, `${header}\n${accountsList}`, { parse_mode: "Markdown" });

      logger.warn("Balance inquiry - default account missing", {
        userId,
        accountCount: normalizedAccounts.length,
      });
      return;
    }

    const balanceLine = formatAccountBalanceLine(defaultAccount, language, {
      includeDefaultIndicator: true,
    });
    const message = getMultiAccountBalanceMessage(
      balanceLine,
      normalizedAccounts.length,
      language
    );
    const viewAllPrompt = getViewAllAccountsPrompt(language);

    await bot.sendMessage(msg.chat.id, `${message}\n\n${viewAllPrompt}`, {
      parse_mode: "Markdown",
    });

    logger.info("Balance inquiry - default account shown", {
      userId,
      accountId: defaultAccount._id,
      accountCount: normalizedAccounts.length,
    });
  } catch (error) {
    logger.error("Error fetching balance", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });

    const errorMsg = getBalanceErrorMessage(language);
    await bot.sendMessage(msg.chat.id, errorMsg, { parse_mode: "Markdown" });

    const classifiedMessage = handleConvexError(error, language, {
      context: "balance_inquiry",
      userId,
    });

    logger.debug("Balance inquiry detailed error", {
      userId,
      errorMessage: classifiedMessage,
    });
  }
}

/**
 * Handle set default account intent
 */
async function handleSetDefaultIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string,
  accountName: string
): Promise<void> {
  const language = detectUserLanguage(msg.text, msg.from?.language_code);

  try {
    const userResult = await convexClient.query(api.users.getUserByTelegramId, {
      telegramUserId: userId,
    });

    if (!userResult) {
      const errorMsg =
        language === "ar"
          ? "عذراً، لم أتمكن من العثور على حسابك. يرجى استخدام /start للبدء."
          : "Sorry, I couldn't find your account. Please use /start to begin.";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    const accounts = await convexClient.query(api.accounts.getUserAccounts, {
      userId: userResult._id,
    });

    if (!accounts || accounts.length === 0) {
      const emptyMsg = getEmptyAccountsMessage(language);
      await bot.sendMessage(msg.chat.id, emptyMsg, { parse_mode: "Markdown" });
      return;
    }

    const targetAccount = accounts.find(
      (acc) => acc.name.toLowerCase() === accountName.toLowerCase()
    );

    if (!targetAccount) {
      const notFoundMsg = getAccountNotFoundMessage(language);
      await bot.sendMessage(msg.chat.id, notFoundMsg);
      logger.info("Account not found for set default", {
        userId,
        requestedName: accountName,
      });
      return;
    }

    const result = await convexClient.mutation(api.accounts.setDefaultAccount, {
      userId: userResult._id,
      accountId: targetAccount._id,
    });

    if (!result) {
      throw new Error("Failed to set default account");
    }

    let confirmationMsg: string;
    if (result.alreadyDefault) {
      confirmationMsg = getAlreadyDefaultMessage(targetAccount.name, language);
    } else {
      confirmationMsg = getDefaultAccountConfirmation(targetAccount.name, language);
    }

    await bot.sendMessage(msg.chat.id, confirmationMsg, {
      parse_mode: "Markdown",
    });

    logger.info("Default account set", {
      userId,
      accountId: targetAccount._id,
      accountName: targetAccount.name,
      alreadyDefault: result.alreadyDefault,
    });
  } catch (error) {
    logger.error("Error setting default account", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      accountName,
    });

    const errorMsg =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء تعيين الحساب الافتراضي. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error setting the default account. Please try again.";

    await bot.sendMessage(msg.chat.id, errorMsg);
  }
}

/**
 * Handle account list intent
 */
async function handleAccountListIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string
): Promise<void> {
  const language = detectUserLanguage(msg.text, msg.from?.language_code);

  try {
    const userResult = await convexClient.query(api.users.getUserByTelegramId, {
      telegramUserId: userId,
    });

    if (!userResult) {
      const errorMsg =
        language === "ar"
          ? "عذراً، لم أتمكن من العثور على حسابك. يرجى استخدام /start للبدء."
          : "Sorry, I couldn't find your account. Please use /start to begin.";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    const accounts = await convexClient.query(api.accounts.getUserAccounts, {
      userId: userResult._id,
    });

    if (!accounts || accounts.length === 0) {
      const emptyMsg = getEmptyAccountsMessage(language);
      await bot.sendMessage(msg.chat.id, emptyMsg, { parse_mode: "Markdown" });
      logger.info("Account list shown - empty", { userId });
      return;
    }

    const header = getAccountListHeader(language);
    const accountsList = formatAccountsList(accounts, language);
    const fullMessage = header + "\n" + accountsList;

    await bot.sendMessage(msg.chat.id, fullMessage, { parse_mode: "Markdown" });

    logger.info("Account list shown", {
      userId,
      accountCount: accounts.length,
    });
  } catch (error) {
    logger.error("Error fetching account list", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });

    const errorMsg =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء جلب حساباتك. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error fetching your accounts. Please try again.";

    await bot.sendMessage(msg.chat.id, errorMsg);
  }
}

/**
 * Handle account creation flow based on current session step
 */
async function handleAccountCreationFlow(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string,
  session: any
): Promise<void> {
  const language = detectUserLanguage(msg.text, msg.from?.language_code);
  const userInput = msg.text || "";

  try {
    if (session.step === "awaiting_type") {
      // Parse account type
      const accountType = parseAccountType(userInput);

      if (!accountType) {
        const errorMsg =
          language === "ar"
            ? "نوع الحساب غير صحيح. الرجاء اختيار: بنك، نقد، أو ائتمان"
            : "Invalid account type. Please choose: bank, cash, or credit";
        await bot.sendMessage(msg.chat.id, errorMsg);
        return;
      }

      // Update session with account type
      sessionManager.updateAccountCreation(userId, { type: accountType });
      sessionManager.nextAccountCreationStep(userId);

      // Prompt for account name
      const prompt = getAccountNamePrompt(language);
      await bot.sendMessage(msg.chat.id, prompt, { parse_mode: "Markdown" });

      logger.info("Account type selected", {
        userId,
        accountType,
      });
    } else if (session.step === "awaiting_name") {
      // Validate name length
      const trimmedName = userInput.trim();

      if (trimmedName.length < 1 || trimmedName.length > 50) {
        const errorMsg =
          language === "ar"
            ? "اسم الحساب يجب أن يكون بين 1 و 50 حرفاً"
            : "Account name must be between 1 and 50 characters";
        await bot.sendMessage(msg.chat.id, errorMsg);
        return;
      }

      // Update session with account name
      sessionManager.updateAccountCreation(userId, { name: trimmedName });
      sessionManager.nextAccountCreationStep(userId);

      // Prompt for initial balance
      const prompt = getInitialBalancePrompt(language);
      await bot.sendMessage(msg.chat.id, prompt, { parse_mode: "Markdown" });

      logger.info("Account name provided", {
        userId,
        nameLength: trimmedName.length,
      });
    } else if (session.step === "awaiting_balance") {
      // Parse balance
      const balance = parseBalance(userInput);

      if (balance === null) {
        const errorMsg =
          language === "ar"
            ? "رصيد غير صحيح. الرجاء إدخال رقم (مثال: 5000)"
            : "Invalid balance. Please enter a number (e.g., 5000)";
        await bot.sendMessage(msg.chat.id, errorMsg);
        return;
      }

      // Validate balance for account type
      const accountType = session.data.type;
      if (accountType !== "credit" && balance < 0) {
        const errorMsg =
          language === "ar"
            ? "لا يمكن أن يكون الرصيد الأولي سالباً لحسابات البنك أو النقد"
            : "Initial balance cannot be negative for bank or cash accounts";
        await bot.sendMessage(msg.chat.id, errorMsg);
        return;
      }

      // Get user's Convex ID
      const userResult = await convexClient.query(api.users.getUserByTelegramId, {
        telegramUserId: userId,
      });

      if (!userResult) {
        throw new Error("User not found in database");
      }

      // Create account in Convex
      const account = await convexClient.mutation(api.accounts.createAccount, {
        userId: userResult._id,
        name: session.data.name!,
        type: session.data.type!,
        initialBalance: balance,
      });

      if (!account) {
        throw new Error("Failed to create account");
      }

      // Clear session
      sessionManager.clearSession(userId);

      // Send confirmation message
      const confirmationMsg = formatAccountConfirmation(
        {
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        },
        language
      );

      await bot.sendMessage(msg.chat.id, confirmationMsg, {
        parse_mode: "Markdown",
      });

      logger.info("Account created successfully", {
        userId,
        accountId: account.accountId,
        accountType: account.type,
        balance: account.balance,
      });
    }
  } catch (error) {
    logger.error("Error in account creation flow", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      step: session.step,
    });

    // Clear session on error
    sessionManager.clearSession(userId);

    const errorMsg =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error creating your account. Please try again.";

    await bot.sendMessage(msg.chat.id, errorMsg);
  }
}

/**
 * Handle AI-powered intent detection (expenses, income, etc.)
 */
async function handleAIIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string
): Promise<void> {
  try {
    // Get user's Convex ID and language preference
    const userResult = await convexClient.query(api.users.getUserByTelegramId, {
      telegramUserId: userId,
    });

    if (!userResult) {
      const language = detectUserLanguage(msg.text, msg.from?.language_code);
      const errorMsg =
        language === "ar"
          ? "عذراً، لم أتمكن من العثور على حسابك. يرجى استخدام /start للبدء."
          : "Sorry, I couldn't find your account. Please use /start to begin.";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    // Use stored language preference from user profile
    const language = userResult.languagePreference || "en";

    // Call AI to process the message
    logger.info("Processing message with AI", { userId, message: msg.text?.substring(0, 50) });

    const aiResponse = await convexClient.action(api.ai.processUserMessage, {
      userId: userResult._id,
      message: msg.text || "",
    });

    logger.info("AI response received", {
      userId,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      nextAction: aiResponse.nextAction,
    });

    // Handle different intents
    if (aiResponse.intent === "log_expense") {
      await handleExpenseIntent(bot, msg, userId, userResult._id, aiResponse, language);
    } else if (aiResponse.intent === "log_income") {
      await handleIncomeIntent(bot, msg, userId, userResult._id, aiResponse, language);
    } else if (aiResponse.intent === "ask_clarification") {
      // Send clarification question to user (bilingual)
      const question = aiResponse.entities?.question || 
        (language === "ar" 
          ? "هل يمكنك التوضيح من فضلك؟" 
          : "Could you please clarify?");
      await bot.sendMessage(msg.chat.id, question);
    } else {
      // Unknown intent or low confidence - ignore silently
      logger.debug("No actionable intent detected", {
        userId,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
      });
    }
  } catch (error) {
    logger.error("Error in AI intent handling", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });

    // Don't send error to user for non-actionable messages
    // They might just be chatting casually
  }
}

/**
 * Handle expense logging intent
 */
async function handleExpenseIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string,
  convexUserId: string,
  aiResponse: any,
  language: string
): Promise<void> {
  try {
    const entities = aiResponse.entities || {};

    // Validate required fields
    if (!entities.amount || !entities.description) {
      const errorMsg =
        language === "ar"
          ? "عذراً، لم أتمكن من فهم المبلغ أو الوصف. يرجى المحاولة مرة أخرى."
          : "Sorry, I couldn't understand the amount or description. Please try again.";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    // Get user's default account
    const accounts = await convexClient.query(api.accounts.getUserAccounts, {
      userId: convexUserId as any, // Type assertion for Convex ID
    });

    if (!accounts || accounts.length === 0) {
      const errorMsg =
        language === "ar"
          ? "يرجى إنشاء حساب أولاً باستخدام 'إنشاء حساب'"
          : "Please create an account first using 'create account'";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    const defaultAccount = accounts.find((acc) => acc.isDefault) || accounts[0];

    // Store pending transaction in session
    const pendingTransaction = {
      type: "expense" as const,
      amount: entities.amount,
      description: entities.description,
      category: entities.category || "Other",
      accountId: defaultAccount._id,
      accountName: defaultAccount.name,
      currency: defaultAccount.currency || "EGP",
      date: Date.now(),
    };

    sessionManager.setPendingTransaction(userId, pendingTransaction);

    // Format confirmation message
    const confirmationMsg =
      language === "ar"
        ? `💸 *مصروف*\n\n` +
          `المبلغ: ${entities.amount} ${defaultAccount.currency || "EGP"}\n` +
          `الوصف: ${entities.description}\n` +
          `الفئة: ${entities.category || "أخرى"}\n` +
          `الحساب: ${defaultAccount.name}\n\n` +
          `هل تريد تسجيل هذا المصروف؟`
        : `💸 *Expense*\n\n` +
          `Amount: ${entities.amount} ${defaultAccount.currency || "EGP"}\n` +
          `Description: ${entities.description}\n` +
          `Category: ${entities.category || "Other"}\n` +
          `Account: ${defaultAccount.name}\n\n` +
          `Would you like to log this expense?`;

    // Send confirmation with inline keyboard
    await bot.sendMessage(msg.chat.id, confirmationMsg, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `confirm_expense:${userId}` },
            { text: "❌ Cancel", callback_data: `cancel_expense:${userId}` },
          ],
        ],
      },
    });

    logger.info("Expense confirmation sent", {
      userId,
      amount: entities.amount,
      description: entities.description,
    });
  } catch (error) {
    logger.error("Error handling expense intent", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });

    const errorMsg =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء معالجة المصروف. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error processing the expense. Please try again.";

    await bot.sendMessage(msg.chat.id, errorMsg);
  }
}

/**
 * Handle income logging intent
 */
async function handleIncomeIntent(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  userId: string,
  convexUserId: string,
  aiResponse: any,
  language: string
): Promise<void> {
  try {
    const entities = aiResponse.entities || {};

    // Validate required fields
    if (!entities.amount || !entities.description) {
      const errorMsg =
        language === "ar"
          ? "عذراً، لم أتمكن من فهم المبلغ أو الوصف. يرجى المحاولة مرة أخرى."
          : "Sorry, I couldn't understand the amount or description. Please try again.";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    // Get user's default account
    const accounts = await convexClient.query(api.accounts.getUserAccounts, {
      userId: convexUserId as any, // Type assertion for Convex ID
    });

    if (!accounts || accounts.length === 0) {
      const errorMsg =
        language === "ar"
          ? "يرجى إنشاء حساب أولاً باستخدام 'إنشاء حساب'"
          : "Please create an account first using 'create account'";
      await bot.sendMessage(msg.chat.id, errorMsg);
      return;
    }

    const defaultAccount = accounts.find((acc) => acc.isDefault) || accounts[0];

    // Store pending transaction in session
    const pendingTransaction = {
      type: "income" as const,
      amount: entities.amount,
      description: entities.description,
      category: entities.category || "Other",
      accountId: defaultAccount._id,
      accountName: defaultAccount.name,
      currency: defaultAccount.currency || "EGP",
      date: Date.now(),
    };

    sessionManager.setPendingTransaction(userId, pendingTransaction);

    // Format confirmation message
    const confirmationMsg =
      language === "ar"
        ? `💰 *دخل*\n\n` +
          `المبلغ: ${entities.amount} ${defaultAccount.currency || "EGP"}\n` +
          `الوصف: ${entities.description}\n` +
          `الفئة: ${entities.category || "أخرى"}\n` +
          `الحساب: ${defaultAccount.name}\n\n` +
          `هل تريد تسجيل هذا الدخل؟`
        : `💰 *Income*\n\n` +
          `Amount: ${entities.amount} ${defaultAccount.currency || "EGP"}\n` +
          `Description: ${entities.description}\n` +
          `Category: ${entities.category || "Other"}\n` +
          `Account: ${defaultAccount.name}\n\n` +
          `Would you like to log this income?`;

    // Send confirmation with inline keyboard
    await bot.sendMessage(msg.chat.id, confirmationMsg, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `confirm_income:${userId}` },
            { text: "❌ Cancel", callback_data: `cancel_income:${userId}` },
          ],
        ],
      },
    });

    logger.info("Income confirmation sent", {
      userId,
      amount: entities.amount,
      description: entities.description,
    });
  } catch (error) {
    logger.error("Error handling income intent", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });

    const errorMsg =
      language === "ar"
        ? "عذراً، حدث خطأ أثناء معالجة الدخل. يرجى المحاولة مرة أخرى."
        : "Sorry, there was an error processing the income. Please try again.";

    await bot.sendMessage(msg.chat.id, errorMsg);
  }
}

/**
 * Main message handler
 * Routes messages to appropriate handlers based on intent and session state
 */
export async function handleMessage(
  bot: TelegramBot,
  msg: TelegramBot.Message
): Promise<void> {
  // Ignore non-text messages
  if (!msg.text || !msg.from) {
    return;
  }

  const userId = msg.from.id.toString();

  try {
    // Check if user has an active session
    const session = sessionManager.getSession(userId);

    if (session && session.type === "account_creation") {
      // Continue account creation flow
      await handleAccountCreationFlow(bot, msg, userId, session);
      return;
    }

    // Detect new intents
    if (detectAccountCreationIntent(msg.text)) {
      await handleAccountCreationIntent(bot, msg, userId);
      return;
    }

    if (detectAccountListIntent(msg.text)) {
      await handleAccountListIntent(bot, msg, userId);
      return;
    }

    if (detectBalanceIntent(msg.text)) {
      await handleBalanceIntent(bot, msg, userId);
      return;
    }

    // Check for set default account intent
    const setDefaultIntent = detectSetDefaultIntent(msg.text);
    if (setDefaultIntent.detected && setDefaultIntent.accountName) {
      await handleSetDefaultIntent(bot, msg, userId, setDefaultIntent.accountName);
      return;
    }

    // Try AI-powered expense/income detection for all other messages
    await handleAIIntent(bot, msg, userId);
  } catch (error) {
    logger.error("Error handling message", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      chatId: msg.chat.id,
    });
  }
}

/**
 * Register message handlers with the bot
 */
export function registerMessageHandlers(bot: TelegramBot): void {
  bot.on("message", async (msg: TelegramBot.Message) => {
    // Skip command messages (they're handled by command handlers)
    if (msg.text?.startsWith("/")) {
      return;
    }

    await handleMessage(bot, msg);
  });

  logger.info("Message handlers registered");
}
