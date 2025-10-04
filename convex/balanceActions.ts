"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Check Balance Action (internal - called from messageProcessor)
 */
export const checkBalance = internalAction({
  args: {
    userId: v.number(),
    chatId: v.number(),
    language: v.string(),
    accountId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, chatId, language, accountId }) => {
    console.log(`[balanceActions] Checking balance for user ${userId}`);

    try {
      // Get user accounts
      const accounts = await ctx.runQuery(internal.accounts.getUserAccounts, {
        userId: userId.toString(),
      });

      if (!accounts || accounts.length === 0) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "لا توجد حسابات. استخدم /start لإنشاء حساب جديد."
            : "No accounts found. Use /start to create a new account.",
          replyMarkup: {
            inline_keyboard: [[
              {
                text: language === "ar" ? "إنشاء حساب" : "Create Account",
                callback_data: "create_account:default"
              }
            ]],
          },
        });

        return { success: false, reason: "no_accounts" };
      }

      // If specific account requested, find it
      const targetAccount = accountId 
        ? accounts.find((acc: any) => acc._id === accountId)
        : accounts[0]; // Default to first account

      if (!targetAccount) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "الحساب المطلوب غير موجود."
            : "Requested account not found.",
        });

        return { success: false, reason: "account_not_found" };
      }

      // Format balance message
      let balanceText: string;
      
      if (accounts.length === 1) {
        // Single account
        balanceText = language === "ar"
          ? `💰 رصيدك الحالي\n\n🏦 ${targetAccount.name}\n💵 ${formatAmount(targetAccount.balance)} جنيه`
          : `💰 Your Current Balance\n\n🏦 ${targetAccount.name}\n💵 ${formatAmount(targetAccount.balance)} EGP`;
      } else {
        // Multiple accounts - show all
        const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
        
        const accountsList = accounts.map((acc: any) => 
          `🏦 ${acc.name}: ${formatAmount(acc.balance)} ${language === "ar" ? "جنيه" : "EGP"}`
        ).join("\n");

        balanceText = language === "ar"
          ? `💰 أرصدة الحسابات\n\n${accountsList}\n\n📊 المجموع الكلي: ${formatAmount(totalBalance)} جنيه`
          : `💰 Account Balances\n\n${accountsList}\n\n📊 Total: ${formatAmount(totalBalance)} EGP`;
      }

      // Add quick action buttons
      const quickActions = {
        inline_keyboard: [[
          {
            text: language === "ar" ? "➕ إضافة مصروف" : "➕ Add Expense",
            callback_data: "quick_expense"
          },
          {
            text: language === "ar" ? "📈 إضافة دخل" : "📈 Add Income", 
            callback_data: "quick_income"
          }
        ], [
          {
            text: language === "ar" ? "📊 رسم بياني" : "📊 Chart",
            callback_data: "chart:pie_month"
          },
          {
            text: language === "ar" ? "📋 المعاملات الأخيرة" : "📋 Recent Transactions",
            callback_data: "recent_transactions"
          }
        ]],
      };

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: balanceText,
        replyMarkup: quickActions,
      });

      return {
        success: true,
        accountsCount: accounts.length,
        totalBalance: accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0),
      };

    } catch (error: any) {
      console.error(`[balanceActions] Failed to check balance:`, error);

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar"
          ? "عذراً، فشل في جلب الرصيد. يرجى المحاولة مرة أخرى."
          : "Sorry, failed to fetch balance. Please try again.",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Get Recent Transactions Action (internal - called from messageProcessor)
 */
export const getRecentTransactions = internalAction({
  args: {
    userId: v.number(),
    chatId: v.number(),
    language: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, chatId, language, limit = 5 }) => {
    console.log(`[balanceActions] Getting recent transactions for user ${userId}`);

    try {
      const transactions = await ctx.runQuery(internal.transactions.getRecentTransactions, {
        userId: userId.toString(),
        limit,
      });

      if (!transactions || transactions.length === 0) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? "لا توجد معاملات حتى الآن."
            : "No transactions yet.",
        });

        return { success: true, count: 0 };
      }

      // Format transactions message
      const header = language === "ar" 
        ? `📋 آخر ${transactions.length} معاملات:\n\n`
        : `📋 Recent ${transactions.length} transactions:\n\n`;

      const transactionsList = transactions.map((tx: any, index: number) => {
        const date = new Date(tx.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US");
        const typeIcon = tx.type === "expense" ? "💸" : "📈";
        const sign = tx.type === "expense" ? "-" : "+";
        
        return language === "ar"
          ? `${index + 1}. ${typeIcon} ${sign}${formatAmount(tx.amount)} جنيه\n   📝 ${tx.description}\n   📅 ${date}`
          : `${index + 1}. ${typeIcon} ${sign}${formatAmount(tx.amount)} EGP\n   📝 ${tx.description}\n   📅 ${date}`;
      }).join("\n\n");

      const message = header + transactionsList;

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: message,
        replyMarkup: {
          inline_keyboard: [[
            {
              text: language === "ar" ? "📊 رسم بياني" : "📊 View Chart",
              callback_data: "chart:pie_month"
            },
            {
              text: language === "ar" ? "💰 الرصيد" : "💰 Check Balance",
              callback_data: "check_balance"
            }
          ]],
        },
      });

      return {
        success: true,
        count: transactions.length,
      };

    } catch (error: any) {
      console.error(`[balanceActions] Failed to get transactions:`, error);

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar"
          ? "عذراً، فشل في جلب المعاملات."
          : "Sorry, failed to fetch transactions.",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Format amount with proper thousands separators
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
