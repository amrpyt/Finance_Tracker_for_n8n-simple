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

/**
 * Account creation prompts and messages
 */
export const ACCOUNT_PROMPTS = {
  accountType: {
    en: `*What type of account would you like to create?* 🏦

Please choose one:
• 🏦 *Bank* - For bank accounts
• 💵 *Cash* - For cash wallets
• 💳 *Credit* - For credit cards

Reply with: bank, cash, or credit`,
    ar: `*ما نوع الحساب الذي تريد إنشاءه؟* 🏦

الرجاء الاختيار:
• 🏦 *بنك* - لحسابات البنك
• 💵 *نقد* - للمحافظ النقدية
• 💳 *ائتمان* - لبطاقات الائتمان

رد بـ: بنك، نقد، أو ائتمان`,
  },
  accountName: {
    en: `*What should I call this account?* 📝

Please provide a name (1-50 characters):
Examples: "Main Bank", "Cash Wallet", "Visa Card"`,
    ar: `*ماذا يجب أن أسمي هذا الحساب؟* 📝

الرجاء تقديم اسم (1-50 حرفاً):
أمثلة: "البنك الرئيسي"، "محفظة نقدية"، "بطاقة فيزا"`,
  },
  initialBalance: {
    en: `*What's the current balance?* 💰

Please enter the initial balance (or 0 if empty):
Example: 5000`,
    ar: `*ما هو الرصيد الحالي؟* 💰

الرجاء إدخال الرصيد الأولي (أو 0 إذا كان فارغاً):
مثال: 5000`,
  },
};

/**
 * Account confirmation message template
 */
export const ACCOUNT_CONFIRMATION: BilingualMessage = {
  en: `✅ *Account Created Successfully!*

{emoji} *{name}*
Type: {type}
Balance: {balance} EGP
Currency: EGP

Your account is ready to use! 🎉`,
  ar: `✅ *تم إنشاء الحساب بنجاح!*

{emoji} *{name}*
النوع: {type}
الرصيد: {balance} جنيه
العملة: جنيه

حسابك جاهز للاستخدام! 🎉`,
};

/**
 * Get account type prompt based on language
 */
export function getAccountTypePrompt(language: "en" | "ar" = "en"): string {
  return ACCOUNT_PROMPTS.accountType[language];
}

/**
 * Get account name prompt based on language
 */
export function getAccountNamePrompt(language: "en" | "ar" = "en"): string {
  return ACCOUNT_PROMPTS.accountName[language];
}

/**
 * Get initial balance prompt based on language
 */
export function getInitialBalancePrompt(language: "en" | "ar" = "en"): string {
  return ACCOUNT_PROMPTS.initialBalance[language];
}

/**
 * Account list messages
 */
export const ACCOUNT_LIST_MESSAGES = {
  header: {
    en: "🏦 *Your Accounts*\n",
    ar: "🏦 *حساباتك*\n",
  },
  empty: {
    en: `You don't have any accounts yet. 📭

Create your first account by typing:
• "create account" or
• "إنشاء حساب"`,
    ar: `ليس لديك أي حسابات حتى الآن. 📭

أنشئ حسابك الأول بكتابة:
• "إنشاء حساب" أو
• "create account"`,
  },
  totalBalance: {
    en: "\n💰 *Total Balance:* {total} EGP",
    ar: "\n💰 *الرصيد الإجمالي:* {total} جنيه",
  },
};

/**
 * Balance inquiry messages
 */
export const BALANCE_MESSAGES = {
  header: {
    en: "💰 *Account Balance*",
    ar: "💰 *رصيد الحساب*",
  },
  singleAccount: {
    en: "{header}\n{balanceLine}",
    ar: "{header}\n{balanceLine}",
  },
  multiAccountDefault: {
    en: "⭐ *Default Account:*\n{balanceLine}\n\nYou currently have {totalAccounts} accounts.",
    ar: "⭐ *الحساب الافتراضي:*\n{balanceLine}\n\nلديك حالياً {totalAccounts} حساب/حسابات.",
  },
  viewAllPrompt: {
    en: "To see all balances, type *\"show accounts\"*.",
    ar: "لعرض جميع الأرصدة، اكتب *\"عرض الحسابات\"*.",
  },
  error: {
    en: "⚠️ Sorry, I couldn't fetch your balance right now. Please try again soon.",
    ar: "⚠️ عذراً، تعذر جلب رصيدك الآن. يرجى المحاولة لاحقاً.",
  },
};

/**
 * Get account list header message
 */
export function getAccountListHeader(language: "en" | "ar" = "en"): string {
  return ACCOUNT_LIST_MESSAGES.header[language];
}

/**
 * Get empty accounts message
 */
export function getEmptyAccountsMessage(language: "en" | "ar" = "en"): string {
  return ACCOUNT_LIST_MESSAGES.empty[language];
}

/**
 * Get total balance footer message
 */
export function getTotalBalanceMessage(
  total: number,
  language: "en" | "ar" = "en"
): string {
  return ACCOUNT_LIST_MESSAGES.totalBalance[language].replace(
    "{total}",
    total.toFixed(2)
  );
}

/**
 * Get single account balance response
 */
export function getSingleAccountBalanceMessage(
  balanceLine: string,
  language: "en" | "ar" = "en"
): string {
  const header = BALANCE_MESSAGES.header[language];
  return BALANCE_MESSAGES.singleAccount[language]
    .replace("{header}", header)
    .replace("{balanceLine}", balanceLine);
}

/**
 * Get multi-account default balance response
 */
export function getMultiAccountBalanceMessage(
  balanceLine: string,
  totalAccounts: number,
  language: "en" | "ar" = "en"
): string {
  return BALANCE_MESSAGES.multiAccountDefault[language]
    .replace("{balanceLine}", balanceLine)
    .replace("{totalAccounts}", totalAccounts.toString());
}

/**
 * Get prompt for viewing all account balances
 */
export function getViewAllAccountsPrompt(
  language: "en" | "ar" = "en"
): string {
  return BALANCE_MESSAGES.viewAllPrompt[language];
}

/**
 * Get generic balance error message
 */
export function getBalanceErrorMessage(
  language: "en" | "ar" = "en"
): string {
  return BALANCE_MESSAGES.error[language];
}

/**
 * Default account messages
 */
export const DEFAULT_ACCOUNT_MESSAGES = {
  confirmation: {
    en: "⭐ *'{accountName}'* is now your default account!",
    ar: "⭐ *'{accountName}'* هو الآن حسابك الافتراضي!",
  },
  alreadyDefault: {
    en: "'{accountName}' is already your default account.",
    ar: "'{accountName}' هو بالفعل حسابك الافتراضي.",
  },
  accountNotFound: {
    en: "I couldn't find an account with that name. Please try again.",
    ar: "لم أتمكن من العثور على حساب بهذا الاسم. يرجى المحاولة مرة أخرى.",
  },
};

/**
 * Get default account confirmation message
 */
export function getDefaultAccountConfirmation(
  accountName: string,
  language: "en" | "ar" = "en"
): string {
  return DEFAULT_ACCOUNT_MESSAGES.confirmation[language].replace(
    "{accountName}",
    accountName
  );
}

/**
 * Get already default message
 */
export function getAlreadyDefaultMessage(
  accountName: string,
  language: "en" | "ar" = "en"
): string {
  return DEFAULT_ACCOUNT_MESSAGES.alreadyDefault[language].replace(
    "{accountName}",
    accountName
  );
}

/**
 * Get account not found message
 */
export function getAccountNotFoundMessage(language: "en" | "ar" = "en"): string {
  return DEFAULT_ACCOUNT_MESSAGES.accountNotFound[language];
}
