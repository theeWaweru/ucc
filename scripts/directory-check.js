// Save this as scripts/directory-check.js and run it with `node scripts/directory-check.js`

const fs = require("fs");
const path = require("path");

// Function to check if a file exists
function checkFile(filepath) {
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
    console.log(`✅ File exists: ${filepath}`);
    return true;
  } catch (err) {
    console.log(`❌ File does not exist: ${filepath}`);
    return false;
  }
}

// Function to check directory contents
function checkDirectory(dirPath) {
  try {
    fs.accessSync(dirPath, fs.constants.F_OK);
    console.log(`📁 Directory exists: ${dirPath}`);

    const files = fs.readdirSync(dirPath);
    console.log(`Contents of ${dirPath}:`);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      const prefix = stats.isDirectory() ? "📁" : "📄";
      console.log(`  ${prefix} ${file}`);
    });

    return true;
  } catch (err) {
    console.log(`❌ Directory does not exist: ${dirPath}`);
    return false;
  }
}

// Paths to check
const rootDir = process.cwd();
console.log(`Current working directory: ${rootDir}`);

// Check models directory
const modelsDir = path.join(rootDir, "models");
checkDirectory(modelsDir);

// Check specific model file with different casing possibilities
const modelPaths = [
  path.join(modelsDir, "Sermon.ts"),
  path.join(modelsDir, "sermon.ts"),
  path.join(modelsDir, "Sermons.ts"),
  path.join(modelsDir, "sermons.ts"),
];
modelPaths.forEach(checkFile);

// Check lib directory structure
const libDir = path.join(rootDir, "lib");
checkDirectory(libDir);
checkDirectory(path.join(libDir, "api"));
checkDirectory(path.join(libDir, "db"));

// Check for youtube.ts
checkFile(path.join(libDir, "api", "youtube.ts"));

// Check for db connect file
checkFile(path.join(libDir, "db", "connect.ts"));

// Check project configuration
checkFile(path.join(rootDir, "tsconfig.json"));
checkFile(path.join(rootDir, "next.config.mjs"));
checkFile(path.join(rootDir, "package.json"));
