// scripts/simple-connect.js
// A minimalist script to test MongoDB connection
const mongoose = require("mongoose");

// Connection string directly from MongoDB Atlas
const MONGODB_URI =
  "mongodb+srv://theewaweru:d7rZHnrupzDB199W@ucc.tsu3m.mongodb.net/?retryWrites=true&w=majority&appName=UCC";

async function testConnection() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB!");

    // Simple test to make sure we can query the database
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("Available collections:");
    if (collections.length === 0) {
      console.log("  (No collections found - database is empty)");
    } else {
      collections.forEach((collection) => {
        console.log(`  - ${collection.name}`);
      });
    }

    console.log(
      "\nConnection test successful. You can now set up your admin user."
    );
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);

    if (error.message.includes("auth")) {
      console.log("\nTips for resolving authentication issues:");
      console.log("1. Check if the username and password are correct");
      console.log(
        "2. Ensure your IP address is allowed in MongoDB Atlas Network Access"
      );
      console.log("3. Try resetting your MongoDB user password in Atlas");
    }
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Connection closed.");
    }
  }
}

// Run the test
testConnection();
