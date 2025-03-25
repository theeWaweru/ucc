/**
 * Google Sheets Integration Testing Utility
 *
 * This script tests the Google Sheets integration for prayer requests.
 * It will verify service account credentials, create a test sheet if needed,
 * and add a test prayer request to the sheet.
 *
 * Usage: npx ts-node scripts/sheets-test.ts
 */

import dotenv from "dotenv";
import path from "path";
import { addPrayerRequest, createPrayerRequestSheet } from "../lib/api/sheets";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Check required environment variables
const requiredVars = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY"];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", ")
  );
  console.error("Make sure the following are set in your .env.local file:");
  console.error(
    "- GOOGLE_SERVICE_ACCOUNT_EMAIL: The email of your Google service account"
  );
  console.error(
    "- GOOGLE_PRIVATE_KEY: The private key of your Google service account"
  );
  console.error(
    "- PRAYER_REQUEST_SHEET_ID (optional): The ID of your prayer request Google Sheet"
  );
  process.exit(1);
}

// Test data
const testRequest = {
  id: `test-${Date.now()}`,
  name: "Test User",
  email: "test@example.com",
  phone: "+254700000000",
  prayerRequest: "This is a test prayer request for Google Sheets integration.",
  isUrgent: true,
  isAnonymous: false,
  status: "new",
  date: new Date().toISOString(),
};

// Test anonymous request
const testAnonymousRequest = {
  id: `anon-${Date.now()}`,
  name: "Anonymous",
  email: "redacted@privacy.org",
  phone: "redacted",
  prayerRequest: "This is an anonymous test prayer request.",
  isUrgent: false,
  isAnonymous: true,
  status: "new",
  date: new Date().toISOString(),
};

// Function to run the Google Sheets test
async function runSheetsTest() {
  console.log("🔍 Starting Google Sheets integration test...");

  try {
    // Check if we need to create a new sheet
    if (!process.env.PRAYER_REQUEST_SHEET_ID) {
      console.log(
        "⏳ No sheet ID found, creating a new prayer request sheet..."
      );
      try {
        const sheetId = await createPrayerRequestSheet();
        console.log("✅ Created new prayer request sheet with ID:", sheetId);
        console.log(
          "⚠️ Please add this ID to your .env.local file as PRAYER_REQUEST_SHEET_ID"
        );
      } catch (error) {
        console.error("❌ Failed to create prayer request sheet:", error);
        process.exit(1);
      }
    } else {
      console.log(
        "✅ Using existing prayer request sheet ID:",
        process.env.PRAYER_REQUEST_SHEET_ID
      );
    }

    // Add a regular prayer request
    console.log("⏳ Adding regular test prayer request to sheet...");
    const regularResult = await addPrayerRequest(testRequest);

    if (regularResult.success) {
      console.log("✅ Successfully added regular test prayer request to sheet");
    } else {
      console.error(
        "❌ Failed to add regular test prayer request:",
        regularResult.error
      );
    }

    // Add an anonymous prayer request
    console.log("⏳ Adding anonymous test prayer request to sheet...");
    const anonymousResult = await addPrayerRequest(testAnonymousRequest);

    if (anonymousResult.success) {
      console.log(
        "✅ Successfully added anonymous test prayer request to sheet"
      );
    } else {
      console.error(
        "❌ Failed to add anonymous test prayer request:",
        anonymousResult.error
      );
    }

    console.log("\n✅ Google Sheets integration test completed!");
    console.log(
      "📝 Please check your Google Sheet to verify that the test data was added correctly."
    );
    console.log(
      "📝 The anonymous request should show redacted personal information."
    );
  } catch (error) {
    console.error("❌ An error occurred during the Google Sheets test:", error);
  }
}

// Run the test
runSheetsTest();
