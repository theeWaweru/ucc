// scripts/update-env.js
// Simple script to update .env.local with the correct MongoDB URI
const fs = require("fs");
const path = require("path");

// Path to .env.local file
const envPath = path.join(__dirname, "../.env.local");

// Correct MongoDB URI
const MONGODB_URI =
  "mongodb+srv://theewaweru:d7rZHnrupzDB199W@ucc.tsu3m.mongodb.net/?retryWrites=true&w=majority&appName=UCC";

function updateEnvFile() {
  try {
    console.log("Reading .env.local file...");

    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      console.log("No .env.local file found. Creating a new one...");
      fs.writeFileSync(envPath, "");
    }

    // Read the current content
    let content = fs.readFileSync(envPath, "utf8");

    // Replace the MongoDB URI line or add it if it doesn't exist
    if (content.includes("MONGODB_URI=")) {
      // Replace the existing line
      content = content.replace(
        /MONGODB_URI=.*/g,
        `MONGODB_URI=${MONGODB_URI}`
      );
      console.log("Updated existing MONGODB_URI in .env.local");
    } else {
      // Add the line to the file
      content += `\nMONGODB_URI=${MONGODB_URI}`;
      console.log("Added MONGODB_URI to .env.local");
    }

    // Make sure we have correct NextAuth settings
    if (!content.includes("NEXTAUTH_SECRET=")) {
      content +=
        "\nNEXTAUTH_SECRET=c7430597a1d04d1a49229c99d2c913e57b1d7f32b4edb60d";
      console.log("Added NEXTAUTH_SECRET to .env.local");
    }

    if (!content.includes("NEXTAUTH_URL=")) {
      content += "\nNEXTAUTH_URL=http://localhost:3000";
      console.log("Added NEXTAUTH_URL to .env.local");
    }

    // Write the updated content back to the file
    fs.writeFileSync(envPath, content);

    console.log("✅ .env.local file has been updated successfully");
  } catch (error) {
    console.error("❌ Error updating .env.local file:", error);
  }
}

updateEnvFile();
