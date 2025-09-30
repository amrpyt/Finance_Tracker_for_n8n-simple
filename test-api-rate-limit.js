const https = require('https');

const API_URL = 'https://toolkit.rork.com/text/llm/';
const TEST_PAYLOAD = {
    messages: [
        {
            role: "system",
            content: "You are an assistant"
        },
        {
            role: "user",
            content: "Test request"
        }
    ]
};

// Track results
const results = {
    successful: 0,
    failed: 0,
    rateLimited: 0,
    errors: [],
    responseTimes: [],
    headers: new Set()
};

// Make a single API request
function makeRequest() {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const postData = JSON.stringify(TEST_PAYLOAD);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(API_URL, options, (res) => {
            let data = '';

            // Capture rate limit headers
            const rateLimitHeaders = [
                'x-ratelimit-limit',
                'x-ratelimit-remaining',
                'x-ratelimit-reset',
                'retry-after',
                'x-rate-limit-limit',
                'x-rate-limit-remaining',
                'x-rate-limit-reset'
            ];

            rateLimitHeaders.forEach(header => {
                if (res.headers[header]) {
                    results.headers.add(`${header}: ${res.headers[header]}`);
                }
            });

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                results.responseTimes.push(responseTime);

                if (res.statusCode === 200) {
                    results.successful++;
                    resolve({ success: true, status: res.statusCode, time: responseTime, headers: res.headers });
                } else if (res.statusCode === 429) {
                    results.rateLimited++;
                    resolve({ success: false, status: res.statusCode, time: responseTime, rateLimited: true, headers: res.headers });
                } else {
                    results.failed++;
                    resolve({ success: false, status: res.statusCode, time: responseTime, data });
                }
            });
        });

        req.on('error', (error) => {
            results.errors.push(error.message);
            results.failed++;
            resolve({ success: false, error: error.message });
        });

        req.write(postData);
        req.end();
    });
}

// Test sequential requests
async function testSequential(count = 10, delayMs = 1000) {
    console.log(`\n📊 Testing ${count} sequential requests (${delayMs}ms delay)...`);
    
    for (let i = 0; i < count; i++) {
        const result = await makeRequest();
        console.log(`Request ${i + 1}: ${result.success ? '✅' : '❌'} Status: ${result.status || 'ERROR'} Time: ${result.time || 'N/A'}ms`);
        
        if (result.rateLimited) {
            console.log(`⚠️  RATE LIMITED at request ${i + 1}`);
            if (result.headers['retry-after']) {
                console.log(`   Retry after: ${result.headers['retry-after']}s`);
            }
        }
        
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

// Test burst requests
async function testBurst(count = 20) {
    console.log(`\n🚀 Testing ${count} concurrent burst requests...`);
    
    const promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(makeRequest());
    }
    
    const results = await Promise.all(promises);
    results.forEach((result, i) => {
        console.log(`Burst ${i + 1}: ${result.success ? '✅' : '❌'} Status: ${result.status || 'ERROR'} Time: ${result.time || 'N/A'}ms`);
    });
}

// Test rapid fire
async function testRapidFire(count = 30, delayMs = 100) {
    console.log(`\n⚡ Testing ${count} rapid requests (${delayMs}ms delay)...`);
    
    for (let i = 0; i < count; i++) {
        const result = await makeRequest();
        console.log(`Rapid ${i + 1}: ${result.success ? '✅' : '❌'} Status: ${result.status || 'ERROR'}`);
        
        if (result.rateLimited) {
            console.log(`⚠️  RATE LIMITED at request ${i + 1}`);
            break;
        }
        
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

// Main test execution
async function runTests() {
    console.log('🔬 API Rate Limit Testing Tool');
    console.log('================================');
    console.log(`Target: ${API_URL}`);
    console.log(`Started: ${new Date().toISOString()}\n`);

    try {
        // Test 1: Sequential with 1s delay
        await testSequential(10, 1000);
        
        // Test 2: Rapid fire with 100ms delay
        await testRapidFire(30, 100);
        
        // Test 3: Burst concurrent
        await testBurst(20);
        
        // Print summary
        console.log('\n\n📈 SUMMARY');
        console.log('================================');
        console.log(`✅ Successful: ${results.successful}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⚠️  Rate Limited: ${results.rateLimited}`);
        console.log(`🔴 Errors: ${results.errors.length}`);
        
        if (results.responseTimes.length > 0) {
            const avgTime = (results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length).toFixed(2);
            const minTime = Math.min(...results.responseTimes);
            const maxTime = Math.max(...results.responseTimes);
            console.log(`\n⏱️  Response Times:`);
            console.log(`   Average: ${avgTime}ms`);
            console.log(`   Min: ${minTime}ms`);
            console.log(`   Max: ${maxTime}ms`);
        }
        
        if (results.headers.size > 0) {
            console.log(`\n📋 Rate Limit Headers Found:`);
            results.headers.forEach(header => console.log(`   ${header}`));
        } else {
            console.log(`\n⚠️  No rate limit headers detected in responses`);
        }
        
        if (results.errors.length > 0) {
            console.log(`\n🔴 Errors:`);
            results.errors.forEach(err => console.log(`   - ${err}`));
        }
        
        console.log('\n================================');
        console.log(`Completed: ${new Date().toISOString()}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
runTests();
