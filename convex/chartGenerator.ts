"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Chart generation configuration
 */
const CHART_CONFIG = {
  quickChartUrl: "https://quickchart.io/chart",
  defaultColors: [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
    "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"
  ],
  maxDataPoints: 10,
} as const;

/**
 * Generate Chart Action (internal - called from messageProcessor)
 */
export const generateChart = internalAction({
  args: {
    userId: v.number(),
    chatId: v.number(),
    chartType: v.string(), // "pie", "bar", "line"
    period: v.string(), // "week", "month", "year"
    language: v.string(),
  },
  handler: async (ctx, { userId, chatId, chartType, period, language }) => {
    console.log(`[chartGenerator] Generating ${chartType} chart for user ${userId}, period: ${period}`);

    try {
      // Get transactions for the specified period
      const transactions = await getTransactionsForPeriod(ctx, userId, period);

      if (!transactions || transactions.length === 0) {
        await ctx.runAction(internal.telegramAPI.sendMessage, {
          chatId,
          text: language === "ar"
            ? `لا توجد معاملات في ${getPeriodName(period, language)}`
            : `No transactions found for ${getPeriodName(period, language)}`,
        });

        return { success: false, reason: "no_data" };
      }

      // Generate chart based on type
      let chartUrl: string;
      let caption: string;

      switch (chartType) {
        case "pie":
          ({ chartUrl, caption } = await generatePieChart(transactions, period, language));
          break;
        case "bar":
          ({ chartUrl, caption } = await generateBarChart(transactions, period, language));
          break;
        case "line":
          ({ chartUrl, caption } = await generateLineChart(transactions, period, language));
          break;
        default:
          ({ chartUrl, caption } = await generatePieChart(transactions, period, language));
      }

      if (!chartUrl) {
        throw new Error("Failed to generate chart URL");
      }

      // Send chart image
      await ctx.runAction(internal.telegramAPI.sendPhoto, {
        chatId,
        photoUrl: chartUrl,
        caption,
      });

      // Send quick action buttons
      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar" ? "اختر نوع رسم آخر:" : "Choose another chart type:",
        replyMarkup: {
          inline_keyboard: [[
            {
              text: language === "ar" ? "🥧 دائري" : "🥧 Pie Chart",
              callback_data: `chart:pie_${period}`
            },
            {
              text: language === "ar" ? "📊 أعمدة" : "📊 Bar Chart",
              callback_data: `chart:bar_${period}`
            }
          ], [
            {
              text: language === "ar" ? "📈 خطي" : "📈 Line Chart",
              callback_data: `chart:line_${period}`
            },
            {
              text: language === "ar" ? "💰 الرصيد" : "💰 Balance",
              callback_data: "check_balance"
            }
          ]],
        },
      });

      return {
        success: true,
        chartType,
        period,
        transactionCount: transactions.length,
      };

    } catch (error: any) {
      console.error(`[chartGenerator] Failed to generate chart:`, error);

      await ctx.runAction(internal.telegramAPI.sendMessage, {
        chatId,
        text: language === "ar"
          ? "عذراً، فشل في إنشاء الرسم البياني."
          : "Sorry, failed to generate chart.",
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Get transactions for a specific period
 */
async function getTransactionsForPeriod(ctx: any, userId: number, period: string): Promise<any[]> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to month
  }

  return await ctx.runQuery(internal.transactions.getTransactionsByPeriod, {
    userId: userId.toString(),
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  });
}

/**
 * Generate pie chart for expenses by category
 */
async function generatePieChart(transactions: any[], period: string, language: string): Promise<{
  chartUrl: string;
  caption: string;
}> {
  // Group expenses by category
  const expensesByCategory: { [key: string]: number } = {};
  let totalExpenses = 0;

  transactions.forEach(tx => {
    if (tx.type === "expense") {
      const category = tx.category || "Other";
      expensesByCategory[category] = (expensesByCategory[category] || 0) + tx.amount;
      totalExpenses += tx.amount;
    }
  });

  if (totalExpenses === 0) {
    throw new Error("No expenses found for pie chart");
  }

  // Prepare chart data
  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory);

  const chartConfig = {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: CHART_CONFIG.defaultColors.slice(0, categories.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: language === "ar" 
            ? `المصروفات حسب الفئة - ${getPeriodName(period, language)}`
            : `Expenses by Category - ${getPeriodName(period, language)}`,
          font: { size: 16 }
        },
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 } }
        }
      }
    }
  };

  const chartUrl = `${CHART_CONFIG.quickChartUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=500&height=400`;

  // Create caption with breakdown
  const breakdown = categories.map(category => {
    const amount = expensesByCategory[category];
    const percentage = ((amount / totalExpenses) * 100).toFixed(1);
    return language === "ar"
      ? `• ${category}: ${formatAmount(amount)} جنيه (${percentage}%)`
      : `• ${category}: ${formatAmount(amount)} EGP (${percentage}%)`;
  }).join('\n');

  const caption = language === "ar"
    ? `📊 المصروفات حسب الفئة\n${breakdown}\n\n💸 إجمالي المصروفات: ${formatAmount(totalExpenses)} جنيه`
    : `📊 Expenses by Category\n${breakdown}\n\n💸 Total Expenses: ${formatAmount(totalExpenses)} EGP`;

  return { chartUrl, caption };
}

/**
 * Generate bar chart for daily/weekly expenses
 */
async function generateBarChart(transactions: any[], period: string, language: string): Promise<{
  chartUrl: string;
  caption: string;
}> {
  // Group transactions by date
  const expensesByDate: { [key: string]: number } = {};
  
  transactions.forEach(tx => {
    if (tx.type === "expense") {
      const date = new Date(tx.date);
      const dateKey = period === "week" 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + tx.amount;
    }
  });

  const dates = Object.keys(expensesByDate).sort();
  const amounts = dates.map(date => expensesByDate[date]);

  const chartConfig = {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: language === "ar" ? "المصروفات" : "Expenses",
        data: amounts,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: language === "ar"
            ? `المصروفات اليومية - ${getPeriodName(period, language)}`
            : `Daily Expenses - ${getPeriodName(period, language)}`,
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: language === "ar" ? "المبلغ (جنيه)" : "Amount (EGP)"
          }
        }
      }
    }
  };

  const chartUrl = `${CHART_CONFIG.quickChartUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=600&height=400`;

  const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);
  const caption = language === "ar"
    ? `📊 المصروفات اليومية\n💸 إجمالي المصروفات: ${formatAmount(totalExpenses)} جنيه`
    : `📊 Daily Expenses\n💸 Total Expenses: ${formatAmount(totalExpenses)} EGP`;

  return { chartUrl, caption };
}

/**
 * Generate line chart for spending trends
 */
async function generateLineChart(transactions: any[], period: string, language: string): Promise<{
  chartUrl: string;
  caption: string;
}> {
  // Group by date and calculate cumulative expenses
  const expensesByDate: { [key: string]: number } = {};
  
  transactions.forEach(tx => {
    if (tx.type === "expense") {
      const date = new Date(tx.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + tx.amount;
    }
  });

  const sortedDates = Object.keys(expensesByDate).sort();
  const amounts = sortedDates.map(date => expensesByDate[date]);

  // Format dates for display
  const displayDates = sortedDates.map(date => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const chartConfig = {
    type: 'line',
    data: {
      labels: displayDates,
      datasets: [{
        label: language === "ar" ? "المصروفات" : "Expenses",
        data: amounts,
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: language === "ar"
            ? `اتجاه المصروفات - ${getPeriodName(period, language)}`
            : `Spending Trend - ${getPeriodName(period, language)}`,
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: language === "ar" ? "المبلغ (جنيه)" : "Amount (EGP)"
          }
        }
      }
    }
  };

  const chartUrl = `${CHART_CONFIG.quickChartUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=600&height=400`;

  const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);
  const avgDaily = totalExpenses / amounts.length;
  
  const caption = language === "ar"
    ? `📈 اتجاه المصروفات\n💸 إجمالي: ${formatAmount(totalExpenses)} جنيه\n📊 متوسط يومي: ${formatAmount(avgDaily)} جنيه`
    : `📈 Spending Trend\n💸 Total: ${formatAmount(totalExpenses)} EGP\n📊 Daily Average: ${formatAmount(avgDaily)} EGP`;

  return { chartUrl, caption };
}

/**
 * Get period name in specified language
 */
function getPeriodName(period: string, language: string): string {
  const names = {
    en: {
      week: "This Week",
      month: "This Month", 
      year: "This Year",
    },
    ar: {
      week: "هذا الأسبوع",
      month: "هذا الشهر",
      year: "هذا العام",
    },
  };

  const langNames = names[language as keyof typeof names] || names.en;
  return langNames[period as keyof typeof langNames] || period;
}

/**
 * Format amount with proper separators
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
