// Test if functions are already deployed on the backend
const https = require('https');

const BACKEND_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com';

console.log('🔍 Testing Convex backend directly...\n');
console.log(`Backend URL: ${BACKEND_URL}\n`);

// Test 1: Check if backend is responding
console.log('Test 1: Checking backend health...');
const healthUrl = new URL(BACKEND_URL + '/version');

https.get(healthUrl, (res) => {
  console.log(`✅ Backend is responding! Status: ${res.statusCode}\n`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Backend version info:', data);
    
    // Test 2: Try to query the system function
    console.log('\n\nTest 2: Trying to query system:getSystemStatus...');
    
    const queryData = JSON.stringify({
      path: 'system:getSystemStatus',
      args: {},
      format: 'json'
    });
    
    const queryUrl = new URL(BACKEND_URL + '/api/query');
    
    const options = {
      hostname: queryUrl.hostname,
      port: 443,
      path: queryUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(queryData)
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        console.log('\nResponse:');
        try {
          const parsed = JSON.parse(responseData);
          console.log(JSON.stringify(parsed, null, 2));
          
          if (parsed.status === 'healthy') {
            console.log('\n✅ SUCCESS! The system:getSystemStatus function is already deployed and working!');
            console.log('   You can now start the bot!');
          } else if (parsed.error) {
            console.log('\n⚠️  Function not found or error:', parsed.error);
            console.log('   The function needs to be deployed.');
          }
        } catch (e) {
          console.log(responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Query failed:', error.message);
    });
    
    req.write(queryData);
    req.end();
  });
}).on('error', (error) => {
  console.error('❌ Backend not reachable:', error.message);
});
