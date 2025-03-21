// This is a simple script to set up your development environment
// Run with: node scripts/setup.js

const fetch = require("node-fetch");

async function setupAdmin() {
  try {
    console.log("Setting up initial admin user...");

    const response = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Admin User",
        email: "admin@uhaicentre.church",
        password: "password123", // Change this in production!
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Admin user created successfully!");
      console.log("Email: admin@uhaicentre.church");
      console.log("Password: password123");
    } else {
      console.log("❌ Failed to create admin user:", data.error);
    }
  } catch (error) {
    console.error("Error setting up admin user:", error);
  }
}

// Make sure the server is running before executing this script
console.log(
  "Make sure your development server is running at http://localhost:3000"
);
console.log("Press any key to continue...");

process.stdin.once("data", async () => {
  await setupAdmin();
  process.exit();
});
