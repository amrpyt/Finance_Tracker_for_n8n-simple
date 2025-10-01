// Simple test script to verify bot connection
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

console.log('✅ Bot token loaded');
console.log('🚀 Attempting to connect to Telegram...');

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

bot.getMe()
  .then((botInfo) => {
    console.log('✅ Bot connected successfully!');
    console.log('📋 Bot Info:', {
      id: botInfo.id,
      username: botInfo.username,
      name: botInfo.first_name,
    });
    console.log('\n📱 Bot is ready! Send /start or /help in Telegram to test.');
  })
  .catch((error) => {
    console.error('❌ Failed to connect:', error.message);
    process.exit(1);
  });

// Register command handlers
bot.onText(/\/start/, (msg) => {
  console.log('📥 Received /start command from user:', msg.from.id);
  bot.sendMessage(msg.chat.id, "Hello! I'm your finance bot.");
});

bot.onText(/\/help/, (msg) => {
  console.log('📥 Received /help command from user:', msg.from.id);
  bot.sendMessage(
    msg.chat.id,
    'Available commands:\n/start - Start the bot\n/help - Show this help message'
  );
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  bot.stopPolling().then(() => {
    console.log('✅ Bot stopped');
    process.exit(0);
  });
});
