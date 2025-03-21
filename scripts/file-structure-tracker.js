// file-structure-tracker.js
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

// Configuration
const config = {
  rootDir: ".", // Root directory of the project
  outputFile: "file-structure.md", // Output file name
  excludeDirs: [".git", "node_modules", ".next", "out", ".vercel", ".vscode"], // Directories to exclude
  excludeFiles: [
    ".DS_Store",
    "file-structure.md", // Don't include the output file itself
    "file-structure-tracker.js",
  ], // Files to exclude
  maxDepth: 10, // Maximum directory depth to traverse
};

/**
 * Get a directory tree structure
 * @param {string} dir - Directory to scan
 * @param {number} depth - Current depth
 * @returns {Promise<Array>} - Array of file paths
 */
async function getDirectoryTree(dir, depth = 0) {
  if (depth > config.maxDepth) return [];

  try {
    const items = await readdir(dir);
    let result = [];

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const itemStat = await stat(itemPath);
      const relativePath = path.relative(config.rootDir, itemPath);

      // Skip excluded directories and files
      if (
        (itemStat.isDirectory() && config.excludeDirs.includes(item)) ||
        (itemStat.isFile() && config.excludeFiles.includes(item))
      ) {
        continue;
      }

      if (itemStat.isDirectory()) {
        result.push({
          path: relativePath,
          type: "directory",
        });
        const subItems = await getDirectoryTree(itemPath, depth + 1);
        result = [...result, ...subItems];
      } else {
        result.push({
          path: relativePath,
          type: "file",
        });
      }
    }

    return result;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

/**
 * Generate markdown representation of the file structure
 * @param {Array} items - Array of file paths
 * @returns {string} - Markdown content
 */
function generateMarkdown(items) {
  // Sort items to ensure directories come before files
  items.sort((a, b) => {
    // First sort by directory/file type
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    // Then sort by path
    return a.path.localeCompare(b.path);
  });

  let markdown = "# Project File Structure\n\n";
  markdown += "Generated on: " + new Date().toISOString() + "\n\n";
  markdown += "```\n";

  const dirStructure = {};

  // Organize items into a nested structure
  for (const item of items) {
    const parts = item.path.split(path.sep);
    let current = dirStructure;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1 && item.type === "file") {
        current[part] = null; // Files are represented as null
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }

  // Generate tree representation
  function printTree(obj, prefix = "", isLast = true) {
    const entries = Object.entries(obj || {});
    let result = "";

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const isLastEntry = i === entries.length - 1;

      // Print current entry
      result += prefix + (isLast ? "└── " : "├── ") + key + "\n";

      // If it's a directory (value is an object), recursively print its contents
      if (value !== null) {
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        result += printTree(value, newPrefix, isLastEntry);
      }
    }

    return result;
  }

  markdown += printTree(dirStructure);
  markdown += "```\n\n";

  // Add some statistics
  const fileCount = items.filter((item) => item.type === "file").length;
  const dirCount = items.filter((item) => item.type === "directory").length;

  markdown += `## Statistics\n\n`;
  markdown += `- Total files: ${fileCount}\n`;
  markdown += `- Total directories: ${dirCount}\n`;

  return markdown;
}

/**
 * Main function to generate the file structure
 */
async function generateFileStructure() {
  try {
    console.log("Scanning project structure...");
    const items = await getDirectoryTree(config.rootDir);

    console.log(`Found ${items.length} items`);
    const markdown = generateMarkdown(items);

    await writeFile(config.outputFile, markdown);
    console.log(`File structure written to ${config.outputFile}`);
  } catch (error) {
    console.error("Error generating file structure:", error);
  }
}

// Run the generator
generateFileStructure();
