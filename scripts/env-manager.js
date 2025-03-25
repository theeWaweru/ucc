// scripts/env-manager.js
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { program } = require("commander");

// Setup command-line options
program
  .option("-c, --check", "Check if .env file exists and has required variables")
  .option("-g, --generate", "Generate a new .env file with example values")
  .option("-u, --update", "Update existing .env file with new variables")
  .option("-l, --list", "List all environment variables in the .env file")
  .option(
    "-s, --set <entries...>",
    "Set specific environment variables (KEY=VALUE format)"
  )
  .option(
    "-i, --interactive",
    "Run in interactive mode to set up environment variables"
  );

program.parse(process.argv);
const options = program.opts();

// Path to .env files
const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(process.cwd(), ".env.example");

// Required environment variables
const requiredVariables = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "MONGODB_URI",
  "YOUTUBE_API_KEY",
  "BREVO_API_KEY",
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_PASSKEY",
  "MPESA_SHORTCODE",
];

// Default values for example .env file
const defaultValues = {
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "generate-a-secret-key-here",
  MONGODB_URI:
    "mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority",
  YOUTUBE_API_KEY: "your-youtube-api-key",
  BREVO_API_KEY: "your-brevo-api-key",
  MPESA_CONSUMER_KEY: "your-mpesa-consumer-key",
  MPESA_CONSUMER_SECRET: "your-mpesa-consumer-secret",
  MPESA_PASSKEY: "your-mpesa-passkey",
  MPESA_SHORTCODE: "your-mpesa-shortcode",
};

// Helper to read existing .env file
function readEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const envVars = {};

      fileContent.split("\n").forEach((line) => {
        // Skip comments and empty lines
        if (line.trim() === "" || line.startsWith("#")) return;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          envVars[key] = value;
        }
      });

      return envVars;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }

  return {};
}

// Helper to write .env file
function writeEnvFile(filePath, envVars) {
  try {
    const content = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Environment file updated: ${filePath}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
  }
}

// Check if .env file exists and has required variables
function checkEnv() {
  console.log("Checking environment variables...");

  if (!fs.existsSync(envPath)) {
    console.log("❌ .env file does not exist");
    return false;
  }

  const envVars = readEnvFile(envPath);
  const missing = [];

  requiredVariables.forEach((variable) => {
    if (!envVars[variable]) {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    console.log(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    return false;
  }

  console.log("✅ All required environment variables are set");
  return true;
}

// Generate a new .env file with example values
function generateEnv() {
  if (fs.existsSync(envPath)) {
    console.log(
      "⚠️ .env file already exists. Use --update to add missing variables."
    );
    return;
  }

  writeEnvFile(envPath, defaultValues);
  console.log("✅ Generated new .env file with example values");
}

// Update existing .env file with new variables
function updateEnv() {
  const currentEnv = fs.existsSync(envPath) ? readEnvFile(envPath) : {};
  const exampleEnv = fs.existsSync(envExamplePath)
    ? readEnvFile(envExamplePath)
    : defaultValues;

  const updatedEnv = { ...currentEnv };
  let changed = false;

  Object.keys(exampleEnv).forEach((key) => {
    if (!updatedEnv[key]) {
      updatedEnv[key] = exampleEnv[key];
      console.log(`Added missing variable: ${key}`);
      changed = true;
    }
  });

  if (changed) {
    writeEnvFile(envPath, updatedEnv);
  } else {
    console.log("✅ No updates needed - all variables already exist");
  }
}

// List all environment variables in the .env file
function listEnv() {
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env file does not exist");
    return;
  }

  const envVars = readEnvFile(envPath);
  console.log("Environment Variables:");
  console.log("----------------------");

  Object.entries(envVars).forEach(([key, value]) => {
    // Mask sensitive values
    const sensitiveKeys = ["SECRET", "KEY", "PASSWORD", "TOKEN", "URI"];
    const isSensitive = sensitiveKeys.some((sensitive) =>
      key.includes(sensitive)
    );
    const displayValue = isSensitive ? "********" : value;

    console.log(`${key} = ${displayValue}`);
  });
}

// Set specific environment variables
function setEnvVars(entries) {
  const currentEnv = fs.existsSync(envPath) ? readEnvFile(envPath) : {};
  const updatedEnv = { ...currentEnv };
  let changed = false;

  entries.forEach((entry) => {
    const match = entry.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      updatedEnv[key] = value;
      console.log(`Set variable: ${key}`);
      changed = true;
    } else {
      console.log(
        `❌ Invalid format for entry: ${entry}. Use KEY=VALUE format.`
      );
    }
  });

  if (changed) {
    writeEnvFile(envPath, updatedEnv);
  }
}

// Run in interactive mode
async function runInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

  console.log("Interactive Environment Setup");
  console.log("-----------------------------");

  const currentEnv = fs.existsSync(envPath) ? readEnvFile(envPath) : {};
  const updatedEnv = { ...currentEnv };

  for (const variable of requiredVariables) {
    const defaultValue = currentEnv[variable] || defaultValues[variable] || "";
    const answer = await question(`${variable} [${defaultValue}]: `);
    updatedEnv[variable] = answer.trim() || defaultValue;
  }

  rl.close();
  writeEnvFile(envPath, updatedEnv);
}

// Main function
async function main() {
  if (options.check) {
    checkEnv();
  } else if (options.generate) {
    generateEnv();
  } else if (options.update) {
    updateEnv();
  } else if (options.list) {
    listEnv();
  } else if (options.set && options.set.length > 0) {
    setEnvVars(options.set);
  } else if (options.interactive) {
    await runInteractive();
  } else {
    // No options specified, show help
    program.help();
  }
}

// Run the script
main();
