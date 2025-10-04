"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Add Expense Action (internal - called from messageProcessor)
 */
export const addExpense = internalAction({
  args: {
    userId: v.number(),
    chatId: v.number(),
    text: v.string(),
    language: v.string(),
  },
  handler: async (ctx, { userId, chatId, text, language }) => {
    console.log(`[expenseActions] Processing expense for user ${userId}`);

    try {
      // Extract amount and description from text
      const parsed = parseExpenseText(text);
      
      if (!parsed.amount || parsed.amount <= 0) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar" 
            ? "لم أستطع العثور على المبلغ. مثال: 'صرفت 50 على القهوة'"
            : "I couldn't find the amount. Example: 'I spent 50 on coffee'",
        });
        return { success: false, reason: "amount_not_found" };
      }

      if (!parsed.description) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "على ماذا صرفت المال؟"
            : "What did you spend money on?",
        });
        return { success: false, reason: "description_missing" };
      }

      // Get user's default account
      const account = await getUserDefaultAccount(ctx, userId);
      if (!account) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "يجب إنشاء حساب أولاً. استخدم /start"
            : "You need to create an account first. Use /start",
        });
        return { success: false, reason: "no_account" };
      }

      // Create expense
      const expense = await ctx.runMutation(internal.transactions.createTransaction, {
        userId: userId.toString(),
        accountId: account._id,
        type: "expense",
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category || "Other",
        date: new Date().toISOString(),
      });

      // Send success message
      const successText = language === "ar"
        ? `✅ تم تسجيل المصروف!\n💸 ${parsed.amount} جنيه - ${parsed.description}\n💰 الرصيد الجديد: ${expense.newBalance} جنيه`
        : `✅ Expense logged!\n💸 ${parsed.amount} EGP - ${parsed.description}\n💰 New balance: ${expense.newBalance} EGP`;

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: successText,
      });

      return {
        success: true,
        transactionId: expense._id,
        amount: parsed.amount,
        newBalance: expense.newBalance,
      };

    } catch (error: any) {
      console.error(`[expenseActions] Failed to add expense:`, error);
      
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar"
          ? "عذراً، فشل في تسجيل المصروف"
          : "Sorry, failed to log expense",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Add Income Action (internal - called from messageProcessor)
 */
export const addIncome = internalAction({
  args: {
    userId: v.number(),
    chatId: v.number(),
    text: v.string(),
    language: v.string(),
  },
  handler: async (ctx, { userId, chatId, text, language }) => {
    console.log(`[expenseActions] Processing income for user ${userId}`);

    try {
      // Extract amount and description from text
      const parsed = parseIncomeText(text);
      
      if (!parsed.amount || parsed.amount <= 0) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "لم أستطع العثور على المبلغ. مثال: 'استلمت راتب 3000'"
            : "I couldn't find the amount. Example: 'I received salary 3000'",
        });
        return { success: false, reason: "amount_not_found" };
      }

      // Get user's default account
      const account = await getUserDefaultAccount(ctx, userId);
      if (!account) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "يجب إنشاء حساب أولاً. استخدم /start"
            : "You need to create an account first. Use /start",
        });
        return { success: false, reason: "no_account" };
      }

      // Create income transaction
      const income = await ctx.runMutation(internal.transactions.createTransaction, {
        userId: userId.toString(),
        accountId: account._id,
        type: "income",
        amount: parsed.amount,
        description: parsed.description || "Income",
        category: parsed.category || "Income",
        date: new Date().toISOString(),
      });

      // Send success message
      const successText = language === "ar"
        ? `✅ تم تسجيل الدخل!\n📈 ${parsed.amount} جنيه - ${parsed.description}\n💰 الرصيد الجديد: ${income.newBalance} جنيه`
        : `✅ Income logged!\n📈 ${parsed.amount} EGP - ${parsed.description}\n💰 New balance: ${income.newBalance} EGP`;

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: successText,
      });

      return {
        success: true,
        transactionId: income._id,
        amount: parsed.amount,
        newBalance: income.newBalance,
      };

    } catch (error: any) {
      console.error(`[expenseActions] Failed to add income:`, error);
      
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar"
          ? "عذراً، فشل في تسجيل الدخل"
          : "Sorry, failed to log income",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Process Income with AI Extraction (internal - called from messageProcessor)
 */
export const processIncomeWithAI = internalAction({
  args: {
    userId: v.number(),
    chatId: v.number(),
    text: v.string(),
    language: v.string(),
  },
  handler: async (ctx, { userId, chatId, text, language }) => {
    console.log(`[expenseActions] Processing income with AI for user ${userId}`);

    try {
      // Step 1: Use AI to extract income information
      const aiResult = await ctx.runAction(internal.rorkIntegration.processUserMessage, {
        text,
        language,
        userId: userId.toString(),
      });

      if (!aiResult.success) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "عذراً، فشل في معالجة رسالتك. حاول مرة أخرى."
            : "Sorry, failed to process your message. Please try again.",
        });
        return { success: false, reason: "ai_processing_failed" };
      }

      // Step 2: Validate AI detected income intent
      if (aiResult.intent !== "log_income") {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "لم أتمكن من فهم طلب تسجيل الدخل. جرب: 'استلمت راتب 3000'"
            : "I couldn't understand the income request. Try: 'I received salary 3000'",
        });
        return { success: false, reason: "wrong_intent" };
      }

      // Step 3: Handle clarification if needed
      if (aiResult.needsClarification || aiResult.confidence < 0.7) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "هل يمكنك توضيح المبلغ ومصدر الدخل؟ مثال: 'استلمت راتب 3000 جنيه'"
            : "Could you clarify the amount and income source? Example: 'I received salary 3000 EGP'",
        });
        return { success: false, reason: "clarification_needed" };
      }

      // Step 4: Validate extracted data
      const entities = aiResult.entities;
      if (!entities.amount || entities.amount <= 0) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "يرجى تحديد المبلغ. مثال: 'استلمت 3000 جنيه'"
            : "Please specify the amount. Example: 'I received 3000 EGP'",
        });
        return { success: false, reason: "missing_amount" };
      }

      if (!entities.description) {
        entities.description = language === "ar" ? "دخل" : "Income";
      }

      // Step 5: Get user's default account
      const account = await getUserDefaultAccount(ctx, userId);
      if (!account) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "يجب إنشاء حساب أولاً. استخدم /start"
            : "You need to create an account first. Use /start",
        });
        return { success: false, reason: "no_account" };
      }

      // Step 6: Prepare confirmation message
      const confirmationText = language === "ar"
        ? `💰 دخل: ${entities.amount} جنيه\n📝 الوصف: ${entities.description}\n🏦 الحساب: ${account.name}\n📅 التاريخ: اليوم\n\n✅ تأكيد | ❌ إلغاء`
        : `💰 Income: ${entities.amount} EGP\n📝 Description: ${entities.description}\n🏦 Account: ${account.name}\n📅 Date: Today\n\n✅ Confirm | ❌ Cancel`;

      // Step 7: Send confirmation with inline keyboard
      const confirmData = {
        userId: userId.toString(),
        accountId: account._id,
        type: "income",
        amount: entities.amount,
        description: entities.description,
        category: entities.category || "Income",
        date: new Date().toISOString(),
      };

      const confirmDataEncoded = Buffer.from(JSON.stringify(confirmData)).toString('base64');

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: confirmationText,
        replyMarkup: {
          inline_keyboard: [[
            { text: "✅ Confirm", callback_data: `confirm_income:${confirmDataEncoded}` },
            { text: "❌ Cancel", callback_data: "cancel" },
          ]],
        },
      });

      return {
        success: true,
        action: "confirmation_sent",
        extractedData: entities,
        confidence: aiResult.confidence,
      };

    } catch (error: any) {
      console.error(`[expenseActions] Failed to process income with AI:`, error);
      
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar"
          ? "عذراً، فشل في معالجة طلب الدخل"
          : "Sorry, failed to process income request",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Process confirmed income (internal - called from messageProcessor)
 */
export const processConfirmedIncome = internalAction({
  args: {
    incomeData: v.any(),
    chatId: v.number(),
    language: v.string(),
  },
  handler: async (ctx, { incomeData, chatId, language }) => {
    try {
      const income = await ctx.runMutation(internal.transactions.createTransaction, incomeData);

      const successText = language === "ar"
        ? `✅ تم تسجيل الدخل بنجاح!\n💰 ${incomeData.amount} جنيه - ${incomeData.description}\n📈 الرصيد الجديد: ${income.newBalance} جنيه`
        : `✅ Income confirmed!\n💰 ${incomeData.amount} EGP - ${incomeData.description}\n📈 New balance: ${income.newBalance} EGP`;

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: successText,
      });

      return { success: true, newBalance: income.newBalance };

    } catch (error: any) {
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar" ? "فشل في تسجيل الدخل" : "Failed to log income",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Process confirmed expense (internal - called from messageProcessor)
 */
export const processConfirmedExpense = internalAction({
  args: {
    expenseData: v.any(),
    chatId: v.number(),
    language: v.string(),
  },
  handler: async (ctx, { expenseData, chatId, language }) => {
    try {
      const expense = await ctx.runMutation(internal.transactions.createTransaction, expenseData);

      const successText = language === "ar"
        ? `✅ تم تسجيل المصروف بنجاح!\n💸 ${expenseData.amount} جنيه\n💰 الرصيد الجديد: ${expense.newBalance} جنيه`
        : `✅ Expense confirmed!\n💸 ${expenseData.amount} EGP\n💰 New balance: ${expense.newBalance} EGP`;

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: successText,
      });

      return { success: true, newBalance: expense.newBalance };

    } catch (error: any) {
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar" ? "فشل في تسجيل المصروف" : "Failed to log expense",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Parse expense text to extract amount, description, and category
 */
function parseExpenseText(text: string): {
  amount?: number;
  description?: string;
  category?: string;
} {
  // Common patterns for expenses
  const patterns = [
    // "spent 50 on coffee" or "I spent 50 on coffee"
    /(?:spent|paid)\s+(\d+(?:\.\d{2})?)\s+(?:on|for)\s+(.+)/i,
    // "50 coffee" or "50 for coffee"
    /(\d+(?:\.\d{2})?)\s+(?:for\s+)?(.+)/i,
    // Arabic patterns: "صرفت 50 على القهوة"
    /(?:صرفت|دفعت)\s+(\d+(?:\.\d{2})?)\s+(?:على|في)\s+(.+)/i,
    // Simple: "coffee 50"
    /(.+?)\s+(\d+(?:\.\d{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let amount, description;
      
      // Check if first group is number or second
      if (!isNaN(Number(match[1]))) {
        amount = Number(match[1]);
        description = match[2]?.trim();
      } else {
        amount = Number(match[2]);
        description = match[1]?.trim();
      }

      if (amount && description) {
        return {
          amount,
          description,
          category: categorizeExpense(description),
        };
      }
    }
  }

  // Fallback: extract any number
  const numberMatch = text.match(/(\d+(?:\.\d{2})?)/);
  if (numberMatch) {
    return {
      amount: Number(numberMatch[1]),
      description: text.replace(numberMatch[0], '').trim() || "Expense",
      category: "Other",
    };
  }

  return {};
}

/**
 * Parse income text to extract amount, description, and category
 */
function parseIncomeText(text: string): {
  amount?: number;
  description?: string;
  category?: string;
} {
  // Common patterns for income
  const patterns = [
    // "received 3000 salary" or "earned 500 from freelance"
    /(?:received|earned|got)\s+(\d+(?:\.\d{2})?)\s+(?:from\s+)?(.+)/i,
    // "salary 3000"
    /(\d+(?:\.\d{2})?)\s+(.+)/i,
    // Arabic: "استلمت راتب 3000"
    /(?:استلمت|كسبت)\s+(.+?)\s+(\d+(?:\.\d{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let amount, description;
      
      if (!isNaN(Number(match[1]))) {
        amount = Number(match[1]);
        description = match[2]?.trim();
      } else {
        amount = Number(match[2]);
        description = match[1]?.trim();
      }

      if (amount && description) {
        return {
          amount,
          description,
          category: "Income",
        };
      }
    }
  }

  // Fallback
  const numberMatch = text.match(/(\d+(?:\.\d{2})?)/);
  if (numberMatch) {
    return {
      amount: Number(numberMatch[1]),
      description: "Income",
      category: "Income",
    };
  }

  return {};
}

/**
 * Categorize expense based on description
 */
function categorizeExpense(description: string): string {
  const lower = description.toLowerCase();
  
  // Food & Dining
  if (/\b(food|coffee|restaurant|lunch|dinner|breakfast|meal|eat|drink|cafe|قهوة|طعام|غداء|عشاء|مطعم)\b/.test(lower)) {
    return "Food";
  }
  
  // Transportation
  if (/\b(taxi|uber|bus|metro|gas|fuel|transport|car|مواصلات|تاكس|بنزين|سيارة)\b/.test(lower)) {
    return "Transportation";
  }
  
  // Shopping
  if (/\b(shop|buy|purchase|store|mall|clothes|shopping|تسوق|شراء|ملابس|محل)\b/.test(lower)) {
    return "Shopping";
  }
  
  // Bills & Utilities
  if (/\b(bill|electric|water|internet|phone|utility|فاتورة|كهرباء|مياه|انترنت|تلفون)\b/.test(lower)) {
    return "Bills";
  }
  
  // Entertainment
  if (/\b(movie|cinema|game|entertainment|fun|ترفيه|سينما|لعبة|فيلم)\b/.test(lower)) {
    return "Entertainment";
  }
  
  // Healthcare
  if (/\b(doctor|medicine|hospital|health|pharmacy|طبيب|دواء|مستشفى|صحة|صيدلية)\b/.test(lower)) {
    return "Healthcare";
  }
  
  return "Other";
}

/**
 * Get user's default account
 */
async function getUserDefaultAccount(ctx: any, userId: number): Promise<any> {
  try {
    const account = await ctx.runQuery(internal.accounts.getUserDefaultAccount, {
      userId: userId.toString(),
    });
    return account;
  } catch (error) {
    console.warn(`[expenseActions] Failed to get user account:`, error);
    return null;
  }
}
