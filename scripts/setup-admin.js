// scripts/setup-admin.js
// Consolidated admin setup script
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { program } = require("commander");
const readline = require("readline");

// Setup command-line options
program
  .option("-u, --uri <string>", "MongoDB connection URI")
  .option("-d, --database <string>", "Database name")
  .option("-n, --name <string>", "Admin name", "Admin User")
  .option("-e, --email <string>", "Admin email", "admin@uhaicentre.church")
  .option("-p, --password <string>", "Admin password", "password123")
  .option("-r, --role <string>", "Admin role", "admin")
  .option("--reset-password", "Reset password for existing admin")
  .option("--direct", "Use direct connection method")
  .option("--api", "Use API endpoint for setup (requires server running)")
  .option("--no-prompt", "Skip confirmation prompts");

program.parse(process.argv);
const options = program.opts();

// Default MongoDB connection details if not provided
const defaultConfig = {
  username: "theewaweru",
  password: "d7rZHnrupzDB199W",
  cluster: "ucc.tsu3m.mongodb.net",
  database: options.database || "uhaicentre",
};

// Admin schema
const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Admin user details
const adminData = {
  name: options.name,
  email: options.email,
  password: options.password,
  role: options.role,
};

// Create readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt for confirmation
function confirm(message) {
  return new Promise((resolve) => {
    if (options.noPrompt) {
      console.log(message);
      return resolve(true);
    }

    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

// Function to setup admin via API
async function setupAdminViaAPI() {
  try {
    console.log("Setting up admin user via API...");
    const serverUrl = "http://localhost:3000";

    // Check if server is running
    try {
      const response = await fetch(`${serverUrl}/api/admin/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        console.log("✅ Admin user created successfully via API!");
      } else {
        console.error("❌ API setup failed:", data.error);
      }
    } catch (error) {
      console.error(
        "❌ Failed to connect to server. Is your development server running?",
        error.message
      );
      console.log("🔄 Falling back to direct database connection method...");
      await setupAdminDirectly();
    }
  } catch (error) {
    console.error("❌ Error in API setup:", error);
  }
}

// Function to setup admin directly via MongoDB
async function setupAdminDirectly() {
  let connection = null;

  try {
    // Determine connection URI
    let MONGODB_URI = options.uri;
    if (!MONGODB_URI) {
      // Construct URI from default config
      const { username, password, cluster, database } = defaultConfig;
      const encodedPassword = encodeURIComponent(password);
      MONGODB_URI = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${database}?retryWrites=true&w=majority`;
    }

    console.log(
      "Using connection string (with password masked):",
      MONGODB_URI.replace(/:[^:]*@/, ":***@")
    );

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");

    // Create the Admin model
    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("ℹ️ Admin user already exists");
      console.log("Email:", adminData.email);

      if (options.resetPassword) {
        // Reset the password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        await Admin.updateOne(
          { email: adminData.email },
          { password: hashedPassword }
        );
        console.log("✅ Password has been reset to:", adminData.password);
      } else {
        console.log("To reset the password, run with --reset-password flag");
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Create the admin user
      await Admin.create({
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
    console.log("2. Enter the email and password shown above");
    console.log("3. You will be redirected to the admin dashboard");
  } catch (error) {
    console.error("❌ Error setting up admin user:", error);
    if (error.name === "MongoServerError") {
      console.error("MongoDB Server Error:");
      console.error("- Code:", error.code);
      console.error("- Message:", error.errmsg || error.message);
      console.log(
        "\nPlease check your MongoDB Atlas credentials and try again."
      );
    }
  } finally {
    // Close the database connection
    if (connection) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
    rl.close();
  }
}

// Main function
async function main() {
  console.log("Uhai Centre Church - Admin Setup Utility");
  console.log("=======================================");

  // Show configuration
  console.log("\nSetup Configuration:");
  console.log(`- Admin Name: ${adminData.name}`);
  console.log(`- Admin Email: ${adminData.email}`);
  console.log(`- Admin Password: ${adminData.password}`);
  console.log(`- Admin Role: ${adminData.role}`);
  console.log(
    `- Method: ${options.api ? "API" : "Direct Database Connection"}`
  );
  if (options.resetPassword) {
    console.log("- Mode: Reset Password for Existing Admin");
  }

  // Confirm before proceeding
  const confirmed = await confirm(
    "\nDo you want to proceed with this configuration?"
  );

  if (confirmed) {
    if (options.api) {
      await setupAdminViaAPI();
    } else {
      await setupAdminDirectly();
    }
  } else {
    console.log("Operation cancelled.");
    rl.close();
  }
}

// Run the script
main();
