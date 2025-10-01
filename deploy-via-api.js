// Deploy Convex functions via HTTP API
const fs = require('fs');
const https = require('https');

const CONVEX_URL = 'https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com';
const ADMIN_KEY = 'convex-self-hosted|0185efb034c52cfe525327a12f3fdd37bf103207c7121d1cefb6fbd47a644bba10ee1167b8';

// Read function files
const usersJs = fs.readFileSync('convex/users.js', 'utf8');
const schemaJs = fs.readFileSync('convex/schema.js', 'utf8');
const systemJs = fs.readFileSync('convex/system.js', 'utf8');

// Create modules object
const modules = {
  'users.js': usersJs,
  'schema.js': schemaJs,
  'system.js': systemJs
};

// Prepare deployment payload
const payload = JSON.stringify({
  functions: modules,
  dryRun: false
});

const url = new URL(`${CONVEX_URL}/api/deploy`);

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Convex ${ADMIN_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('🚀 Deploying Convex functions...');
console.log(`URL: ${CONVEX_URL}`);

const req = https.request(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Deployment successful!');
      console.log(data);
    } else {
      console.log(`❌ Deployment failed with status ${res.statusCode}`);
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(payload);
req.end();
