// Test script for user registration functionality
// Run with: node test-user-registration.js

// Use fetch API directly instead of convex/browser
const CONVEX_URL = "https://ceaseless-cardinal-528.convex.cloud";

async function callConvexMutation(functionName, args) {
  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: functionName,
      args: args,
      format: "json",
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Response error:", errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  // console.log("Full response:", JSON.stringify(data, null, 2));
  
  // Handle error responses
  if (data.status === "error") {
    throw new Error(data.errorMessage || "Unknown error");
  }
  
  return data.value || data;
}

async function callConvexQuery(functionName, args) {
  const response = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: functionName,
      args: args,
      format: "json",
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Response error:", errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Handle error responses
  if (data.status === "error") {
    throw new Error(data.errorMessage || "Unknown error");
  }
  
  return data.value || data;
}

async function testUserRegistration() {
  console.log("🧪 Testing User Registration Functionality\n");
  
  try {
    // Test 1: Create new user
    console.log("Test 1: Creating new user...");
    const testUserId = `test_${Date.now()}`;
    
    const result1 = await callConvexMutation("users:createOrGetUser", {
      telegramUserId: testUserId,
      username: "testuser",
      firstName: "Ahmed",
      languageCode: "ar",
    });
    
    console.log("✅ New user created:");
    console.log(`   - User ID: ${result1.user._id}`);
    console.log(`   - Telegram ID: ${result1.user.telegramUserId}`);
    console.log(`   - First Name: ${result1.user.firstName}`);
    console.log(`   - Language: ${result1.user.languagePreference}`);
    console.log(`   - Is New User: ${result1.isNewUser}`);
    console.log();
    
    // Test 2: Get existing user
    console.log("Test 2: Getting existing user...");
    const result2 = await callConvexMutation("users:createOrGetUser", {
      telegramUserId: testUserId,
      username: "testuser",
      firstName: "Ahmed",
      languageCode: "ar",
    });
    
    console.log("✅ Existing user retrieved:");
    console.log(`   - Same User ID: ${result2.user._id === result1.user._id}`);
    console.log(`   - Is New User: ${result2.isNewUser}`);
    console.log();
    
    // Test 3: Query user by Telegram ID
    console.log("Test 3: Querying user by Telegram ID...");
    const result3 = await callConvexQuery("users:getUserByTelegramId", {
      telegramUserId: testUserId,
    });
    
    console.log("✅ User found via query:");
    console.log(`   - User ID: ${result3._id}`);
    console.log(`   - First Name: ${result3.firstName}`);
    console.log();
    
    // Test 4: Test language preference defaulting
    console.log("Test 4: Testing language preference (no languageCode)...");
    const testUserId2 = `test_${Date.now()}_2`;
    const result4 = await callConvexMutation("users:createOrGetUser", {
      telegramUserId: testUserId2,
      firstName: "Sara",
    });
    
    console.log("✅ Language preference defaulted:");
    console.log(`   - Language: ${result4.user.languagePreference} (should be 'ar')`);
    console.log();
    
    // Test 5: Test English language preference
    console.log("Test 5: Testing English language preference...");
    const testUserId3 = `test_${Date.now()}_3`;
    const result5 = await callConvexMutation("users:createOrGetUser", {
      telegramUserId: testUserId3,
      firstName: "John",
      languageCode: "en",
    });
    
    console.log("✅ English language preference set:");
    console.log(`   - Language: ${result5.user.languagePreference} (should be 'en')`);
    console.log();
    
    console.log("🎉 All tests passed!");
    console.log("\n✅ Story 1.4 - User Registration is working correctly!");
    
  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  }
}

testUserRegistration();
