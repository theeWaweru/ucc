// scripts/simple-admin-setup.js
// A simpler setup script to create an admin user directly
// Run with: node scripts/simple-admin-setup.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ===== CONFIGURATION =====
// Replace this with your actual MongoDB connection string
const MONGODB_URI = "mongodb_string";

// Admin user details
const adminData = {
  name: "Admin User",
  email: "admin@uhaicentre.church",
  password: "password123",
  role: "admin",
};

// Admin schema
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function setupAdmin() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if Admin model exists
    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists");
      console.log("Email:", adminData.email);

      // Update password option
      const resetPassword = process.argv.includes("--reset-password");

      if (resetPassword) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Update the admin's password
        await Admin.updateOne(
          { email: adminData.email },
          { password: hashedPassword }
        );

        console.log("✅ Password has been reset to:", adminData.password);
      } else {
        console.log(
          "To reset the password, run: node scripts/simple-admin-setup.js --reset-password"
        );
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Create the admin user
      const admin = await Admin.create({
        ...adminData,
        password: hashedPassword,
      });

      console.log("✅ Admin user created successfully!");
      console.log("Email:", adminData.email);
      console.log("Password:", adminData.password);
    }

    // Display login instructions
    console.log("\nℹ️ Login Instructions:");
    console.log("1. Go to http://localhost:3000/auth/sign-in");
    console.log("2. Enter the email and password above");
    console.log("3. You will be redirected to the admin dashboard");
  } catch (error) {
    console.error("❌ Error setting up admin user:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the setup
setupAdmin();
