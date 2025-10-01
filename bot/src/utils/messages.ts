import { BilingualMessage } from "./errors";

/**
 * Welcome message templates for new and returning users
 */
export const WELCOME_MESSAGES = {
  newUser: {
    en: `*Welcome, {firstName}!* 👋

I'm your personal finance assistant. I'll help you track expenses, manage accounts, and stay on top of your finances.

*What I can do:* 💰
• 💸 *Track expenses* - Just tell me what you spent
• 💵 *Log income* - Record your earnings
• 🏦 *Manage accounts* - Track multiple bank accounts, cash, and credit cards
• 📊 *Monitor loans* - Keep track of money you've lent or borrowed

*Try these examples:*
• "paid 50 for coffee" / "دفعت 50 على القهوة"
• "received 5000 salary" / "استلمت 5000 راتب"
• "lent Ahmed 200" / "أقرضت أحمد 200"
• /help - See all commands

Let's get started! 🚀`,
    ar: `*أهلاً، {firstName}!* 👋

أنا مساعدك المالي الشخصي. سأساعدك في تتبع النفقات وإدارة الحسابات والبقاء على اطلاع بأموالك.

*ما يمكنني فعله:* 💰
• 💸 *تتبع النفقات* - فقط أخبرني بما أنفقته
• 💵 *تسجيل الدخل* - سجل أرباحك
• 🏦 *إدارة الحسابات* - تتبع حسابات بنكية متعددة ونقد وبطاقات ائتمان
• 📊 *مراقبة القروض* - تتبع الأموال التي أقرضتها أو اقترضتها

*جرب هذه الأمثلة:*
• "دفعت 50 على القهوة" / "paid 50 for coffee"
• "استلمت 5000 راتب" / "received 5000 salary"
• "أقرضت أحمد 200" / "lent Ahmed 200"
• /help - عرض جميع الأوامر

لنبدأ! 🚀`,
  },
  returningUser: {
    en: `*Welcome back, {firstName}!* 👋

Ready to manage your finances? I'm here to help!

*Quick actions:*
• 💸 Log an expense: "paid 50 for coffee"
• 💵 Record income: "received 5000 salary"
• 🏦 Check accounts: /accounts
• 📊 View transactions: /transactions
• ❓ Need help? /help

What would you like to do today?`,
    ar: `*مرحباً بعودتك، {firstName}!* 👋

مستعد لإدارة أموالك؟ أنا هنا للمساعدة!

*إجراءات سريعة:*
• 💸 تسجيل نفقة: "دفعت 50 على القهوة"
• 💵 تسجيل دخل: "استلمت 5000 راتب"
• 🏦 عرض الحسابات: /accounts
• 📊 عرض المعاملات: /transactions
• ❓ تحتاج مساعدة؟ /help

ماذا تريد أن تفعل اليوم؟`,
  },
};

/**
 * Help message with command reference
 */
export const HELP_MESSAGE: BilingualMessage = {
  en: `*Finance Tracker Bot - Help* 📚

*Available Commands:*

*Basic Commands:*
• /start - Start or restart the bot
• /help - Show this help message
• /status - Check system status

*Account Management:* 🏦
• /accounts - View all your accounts
• "create account" - Add a new account
• "set [account] as default" - Change default account

*Expense & Income Tracking:* 💰
• "paid [amount] for [item]" - Log an expense
• "spent [amount] on [category]" - Track spending
• "received [amount] [description]" - Log income
• /transactions - View recent transactions

*Loan Tracking:* 📊
• "lent [person] [amount]" - Record money you lent
• "borrowed [amount] from [person]" - Record money you borrowed
• /loans - View all loans

*Natural Language Examples:*
• "paid 50 for coffee"
• "spent 200 on groceries"
• "received 5000 salary"
• "lent Ahmed 200"

I understand both English and Arabic! 🌍`,
  ar: `*بوت تتبع المالية - مساعدة* 📚

*الأوامر المتاحة:*

*الأوامر الأساسية:*
• /start - بدء أو إعادة تشغيل البوت
• /help - عرض رسالة المساعدة هذه
• /status - التحقق من حالة النظام

*إدارة الحسابات:* 🏦
• /accounts - عرض جميع حساباتك
• "إنشاء حساب" - إضافة حساب جديد
• "اجعل [الحساب] افتراضي" - تغيير الحساب الافتراضي

*تتبع النفقات والدخل:* 💰
• "دفعت [المبلغ] على [الشيء]" - تسجيل نفقة
• "أنفقت [المبلغ] على [الفئة]" - تتبع الإنفاق
• "استلمت [المبلغ] [الوصف]" - تسجيل دخل
• /transactions - عرض المعاملات الأخيرة

*تتبع القروض:* 📊
• "أقرضت [الشخص] [المبلغ]" - تسجيل مال أقرضته
• "اقترضت [المبلغ] من [الشخص]" - تسجيل مال اقترضته
• /loans - عرض جميع القروض

*أمثلة اللغة الطبيعية:*
• "دفعت 50 على القهوة"
• "أنفقت 200 على البقالة"
• "استلمت 5000 راتب"
• "أقرضت أحمد 200"

أفهم كلاً من الإنجليزية والعربية! 🌍`,
};

/**
 * Get welcome message for user based on language preference
 */
export function getWelcomeMessage(
  firstName: string,
  isNewUser: boolean,
  language: "en" | "ar" = "en"
): string {
  const template = isNewUser
    ? WELCOME_MESSAGES.newUser[language]
    : WELCOME_MESSAGES.returningUser[language];

  return template.replace("{firstName}", firstName);
}

/**
 * Get help message based on language preference
 */
export function getHelpMessage(language: "en" | "ar" = "en"): string {
  return HELP_MESSAGE[language];
}
