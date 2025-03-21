// scripts/direct-admin-setup.js
// Direct admin setup using the confirmed connection string
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Use the connection string directly from MongoDB Atlas
const MONGODB_URI =
  "mongodb+srv://theewaweru:d7rZHnrupzDB199W@ucc.tsu3m.mongodb.net/?retryWrites=true&w=majority&appName=UCC";

// Admin schema - simplified version
const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// Admin user details
const adminData = {
  name: "Admin User",
  email: "admin@uhaicentre.church",
  password: "password123",
  role: "admin",
};

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create the model
    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Try to create the admin user
      const admin = await Admin.create({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role,
      });

      console.log("✅ Admin user created successfully!");
      console.log("Email:", adminData.email);
      console.log("Password:", adminData.password);
    } catch (userError) {
      // If the user already exists (duplicate key error)
      if (userError.code === 11000) {
        console.log("ℹ️ Admin user already exists with this email");

        // Update the password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        const result = await Admin.updateOne(
          { email: adminData.email },
          { password: hashedPassword }
        );

        if (result.modifiedCount > 0) {
          console.log(
            "✅ Admin password has been reset to:",
            adminData.password
          );
        } else {
          console.log("ℹ️ No changes made to admin password");
        }
      } else {
        throw userError;
      }
    }

    console.log("\nℹ️ Login Instructions:");
    console.log("1. Go to http://localhost:3000/auth/sign-in");
    console.log("2. Enter the email and password above");
    console.log("3. You will be redirected to the admin dashboard");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

createAdmin();
