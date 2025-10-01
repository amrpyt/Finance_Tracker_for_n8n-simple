// Manual deployment script for self-hosted Convex
const https = require('https');
const fs = require('fs');
const path = require('path');

const CONVEX_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com';
const ADMIN_KEY = 'convex-self-hosted|01dcc2da5eac0b4327a660eee90c0436eeed476f6ca37fa443b6094b3d586f90728eba671e';

console.log('🚀 Deploying functions to self-hosted Convex...\n');

// Read the function files
const systemJs = fs.readFileSync(path.join(__dirname, 'convex/system.js'), 'utf8');
const schemaJs = fs.readFileSync(path.join(__dirname, 'convex/schema.js'), 'utf8');

console.log('📁 Files to deploy:');
console.log('  - system.js');
console.log('  - schema.js\n');

// Prepare deployment payload
const deploymentData = JSON.stringify({
  functions: {
    'system.js': systemJs,
    'schema.js': schemaJs,
  },
  adminKey: ADMIN_KEY,
});

const url = new URL(CONVEX_URL + '/api/deploy');

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(deploymentData),
    'Authorization': `Bearer ${ADMIN_KEY}`,
  },
};

console.log('📡 Sending deployment request...');
console.log(`URL: ${CONVEX_URL}/api/deploy\n`);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📥 Response:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ Deployment successful!');
      } else {
        console.log('\n❌ Deployment failed');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 This is expected - the HTTP API endpoint may not exist.');
  console.log('   Self-hosted Convex requires using the CLI with proper configuration.');
});

req.write(deploymentData);
req.end();
