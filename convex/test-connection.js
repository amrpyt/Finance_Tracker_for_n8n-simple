// Test connection to self-hosted Convex instance
const https = require('https');
const http = require('http');

const CONVEX_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com';

console.log('🔍 Testing connection to Convex server...');
console.log('URL:', CONVEX_URL);

// Try to fetch the API endpoint
const url = new URL(CONVEX_URL);
const protocol = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: '/api/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = protocol.request(options, (res) => {
  console.log('✅ Connection successful!');
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ Connection failed:', error.message);
});

// Try to query a test function
const queryData = JSON.stringify({
  path: 'system:getSystemStatus',
  args: {},
});

req.write(queryData);
req.end();
