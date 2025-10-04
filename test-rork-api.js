/**
 * Simple test script for Rork API integration
 * Run with: node test-rork-api.js
 */

const RORK_API_KEY = process.env.RORK_API_KEY || 'your_api_key_here';
const RORK_URL = 'https://toolkit.rork.com/text/llm/';

async function testRorkAPI() {
  console.log('🧪 Testing Rork API Integration...\n');

  const testMessages = [
    { message: 'I spent 50 EGP on coffee', language: 'en' },
    { message: 'صرفت ٣٠ جنيه على قهوة', language: 'ar' },
    { message: 'I bought something', language: 'en' },
  ];

  for (const test of testMessages) {
    console.log(`📝 Testing: "${test.message}"`);
    const startTime = Date.now();

    try {
      const response = await fetch(RORK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RORK_API_KEY}`,
        },
        body: JSON.stringify({
          message: test.message,
          system_prompt: 'You are a financial assistant. Extract transaction details.',
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        console.error(`❌ Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`   Details: ${errorText}\n`);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Success (${latency}ms)`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
}

// Run the test
testRorkAPI().catch(console.error);
