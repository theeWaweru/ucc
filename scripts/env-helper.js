// scripts/env-helper.js
// A helper script to update your .env.local file
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// MongoDB connection details
const username = "theewaweru";
const password = "d7rZHnrupzDB199W"; // Make sure this matches what's in MongoDB Atlas
const cluster = "ucc.tsu3m.mongodb.net";
const database = "uhaicentre"; // Database name

// Construct URI with proper encoding
const encodedPassword = encodeURIComponent(password);
const MONGODB_URI = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${database}?retryWrites=true&w=majority`;

// NextAuth secret
const NEXTAUTH_SECRET = "c7430597a1d04d1a49229c99d2c913e57b1d7f32b4edb60d";
const NEXTAUTH_URL = "http://localhost:3000";

// Path to .env.local file
const envPath = path.join(__dirname, "../.env.local");

function updateEnvFile() {
  try {
    console.log("Checking for .env.local file...");

    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      console.log("No .env.local file found. Creating a new one...");
      fs.writeFileSync(envPath, "");
    }

    // Read the current content
    const currentEnv = fs.readFileSync(envPath, "utf8");
    const lines = currentEnv.split("\n");
    const newLines = [];

    // Variables to track if we found and updated each setting
    let foundMongoDB = false;
    let foundNextAuthSecret = false;
    let foundNextAuthUrl = false;

    // Process each line in the file
    for (const line of lines) {
      if (line.startsWith("MONGODB_URI=")) {
        newLines.push(`MONGODB_URI=${MONGODB_URI}`);
        foundMongoDB = true;
      } else if (line.startsWith("NEXTAUTH_SECRET=")) {
        newLines.push(`NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`);
        foundNextAuthSecret = true;
      } else if (line.startsWith("NEXTAUTH_URL=")) {
        newLines.push(`NEXTAUTH_URL=${NEXTAUTH_URL}`);
        foundNextAuthUrl = true;
      } else {
        newLines.push(line);
      }
    }

    // Add any missing variables
    if (!foundMongoDB) {
      newLines.push(`MONGODB_URI=${MONGODB_URI}`);
    }
    if (!foundNextAuthSecret) {
      newLines.push(`NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`);
    }
    if (!foundNextAuthUrl) {
      newLines.push(`NEXTAUTH_URL=${NEXTAUTH_URL}`);
    }

    // Write the updated content back to the file
    fs.writeFileSync(envPath, newLines.join("\n"));

    console.log("✅ .env.local file updated successfully!");
    console.log("\nThe following values have been set:");
    console.log(
      `- MONGODB_URI=mongodb+srv://${username}:********@${cluster}/${database}?retryWrites=true&w=majority`
    );
    console.log(`- NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`);
    console.log(`- NEXTAUTH_URL=${NEXTAUTH_URL}`);

    console.log("\nYou can now run your application with:");
    console.log("npm run dev");
  } catch (error) {
    console.error("❌ Error updating .env.local file:", error);
  }
}

// Ask for confirmation before updating
console.log(
  "This script will update your .env.local file with the following values:"
);
console.log(
  `- MONGODB_URI=mongodb+srv://${username}:********@${cluster}/${database}?retryWrites=true&w=majority`
);
console.log(`- NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`);
console.log(`- NEXTAUTH_URL=${NEXTAUTH_URL}`);
console.log("\nAny existing values for these variables will be overwritten.");
rl.question("\nDo you want to continue? (y/n): ", (answer) => {
  if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
    updateEnvFile();
  } else {
    console.log("Operation cancelled.");
  }
  rl.close();
});
