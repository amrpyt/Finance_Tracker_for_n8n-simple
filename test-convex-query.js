// Test querying the Convex backend directly
const { ConvexHttpClient } = require('convex/browser');

const CONVEX_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com';

console.log('🔍 Testing Convex query...');
console.log('URL:', CONVEX_URL);

const client = new ConvexHttpClient(CONVEX_URL);

async function testQuery() {
  try {
    console.log('\n📡 Attempting to query system:getSystemStatus...');
    
    const result = await client.query('system:getSystemStatus', {});
    
    console.log('✅ Query successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Error details:', error);
  }
}

testQuery();
