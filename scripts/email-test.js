/**
 * Email Testing Utility
 *
 * This script tests email delivery using the application's email system.
 * It's designed to be run from the command line to verify proper email configuration.
 *
 * Usage: npx ts-node scripts/email-test.ts
 */

import dotenv from "dotenv";
import path from "path";
import { sendPrayerRequestNotification } from "../lib/email/prayer-notifications";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Check required environment variables
const requiredVars = ["BREVO_API_KEY", "PRAYER_TEAM_EMAIL"];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", ")
  );
  process.exit(1);
}

// Initialize test data
const testRequest = {
  name: "Test User",
  email: "davidngari47@gmail.com", // This will receive the confirmation email
  phone: "+254700000000",
  prayerRequest:
    "This is a test prayer request to verify email delivery is working correctly.",
  isUrgent: true,
  isAnonymous: false,
};

// Function to run the test
async function runEmailTest() {
  console.log("🔍 Starting email delivery test...");
  console.log("📧 Test email will be sent to:", testRequest.email);
  console.log(
    "📧 Admin notification will be sent to:",
    process.env.PRAYER_TEAM_EMAIL
  );

  try {
    console.log("⏳ Sending test prayer request notification...");
    const result = await sendPrayerRequestNotification(testRequest);

    if (result.success) {
      console.log("✅ Email test completed successfully!");
      console.log("📝 Details:");
      console.log("  - User confirmation email sent to:", testRequest.email);
      console.log(
        "  - Admin notification sent to:",
        process.env.PRAYER_TEAM_EMAIL
      );
      console.log("\n📱 Please check both email inboxes to verify delivery");
    } else {
      console.error("❌ Email test failed:", result.error);
    }
  } catch (error) {
    console.error("❌ An error occurred during the email test:", error);
  }
}

// Run the test
runEmailTest();
