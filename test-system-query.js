// Test if system:getSystemStatus is already deployed
const https = require('https');

const CONVEX_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com';

console.log('🔍 Testing if system:getSystemStatus function exists...\n');

const url = new URL(CONVEX_URL + '/api/query');

const postData = JSON.stringify({
  path: 'system:getSystemStatus',
  args: {},
  format: 'json'
});

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.status === 'healthy') {
        console.log('\n✅ SUCCESS! Function is deployed and working!');
      } else if (parsed.error) {
        console.log('\n❌ Function not found or error:', parsed.error);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(postData);
req.end();
