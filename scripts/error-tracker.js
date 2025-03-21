// error-tracker.js
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { exec } = require("child_process");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const execPromise = promisify(exec);

// Configuration
const config = {
  outputFile: "error-report.md",
  buildCommand: "npm run build",
  testCommand: "npm run lint",
  checkDependencies: true,
};

/**
 * Run a command and capture its output
 * @param {string} command - Command to run
 * @returns {Promise<{stdout: string, stderr: string}>} - Command output
 */
async function runCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { stdout, stderr, success: !stderr };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      success: false,
    };
  }
}

/**
 * Check package.json for dependency issues
 * @returns {Promise<Array<string>>} - Array of issues found
 */
async function checkPackageDependencies() {
  try {
    const packageData = await readFile("package.json", "utf8");
    const { dependencies, devDependencies } = JSON.parse(packageData);

    const issues = [];

    // Check for missing dependencies
    const requiredDeps = [
      // List common critical dependencies
      { name: "react", type: "dependencies" },
      { name: "react-dom", type: "dependencies" },
      { name: "next", type: "dependencies" },
    ];

    for (const dep of requiredDeps) {
      const depObj =
        dep.type === "dependencies" ? dependencies : devDependencies;
      if (!depObj || !depObj[dep.name]) {
        issues.push(
          `Missing ${dep.type.replace("dependencies", "dependency")}: ${
            dep.name
          }`
        );
      }
    }

    // Check for peer dependency issues
    // This is a simplified check - in reality you'd need to parse the npm ls output
    if (dependencies?.["react"] && dependencies?.["react-dom"]) {
      const reactVersion = dependencies["react"].replace(/[^0-9.]/g, "");
      const reactDomVersion = dependencies["react-dom"].replace(/[^0-9.]/g, "");

      if (reactVersion !== reactDomVersion) {
        issues.push(
          `Mismatched React (${reactVersion}) and React DOM (${reactDomVersion}) versions`
        );
      }
    }

    return issues;
  } catch (error) {
    return [`Error checking dependencies: ${error.message}`];
  }
}

/**
 * Check for TypeScript errors
 * @returns {Promise<{success: boolean, issues: Array<string>}>} - TypeScript check result
 */
async function checkTypeScript() {
  const result = await runCommand("npx tsc --noEmit");

  // Parse the TypeScript errors into a more readable format
  const issues = [];
  if (!result.success) {
    const errorLines = result.stderr
      .split("\n")
      .filter((line) => line.includes("error"));

    for (const line of errorLines) {
      // Extract filename, line, and error message
      const match = line.match(/(.+)\((\d+),(\d+)\):\s+error\s+(.+)$/);
      if (match) {
        const [_, filename, lineNum, colNum, message] = match;
        issues.push(
          `${path.basename(filename)}:${lineNum} - ${message.trim()}`
        );
      } else {
        issues.push(line);
      }
    }
  }

  return {
    success: result.success,
    issues: issues.length > 0 ? issues : [],
  };
}

/**
 * Main function to generate the error report
 */
async function generateErrorReport() {
  console.log("Generating error report...");
  let markdown = "# Project Error Report\n\n";
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;

  // Check build process
  console.log("Running build check...");
  markdown += "## Build Status\n\n";
  const buildResult = await runCommand(config.buildCommand);

  if (buildResult.success) {
    markdown += "✅ Build successful\n\n";
  } else {
    markdown += "❌ Build failed\n\n";
    markdown += "```\n" + buildResult.stderr + "\n```\n\n";

    // Try to extract and categorize common errors
    const errorSummary = [];

    // Module resolution errors
    const moduleErrors = (
      buildResult.stderr.match(/Cannot find module '(.+)'/g) || []
    ).map((e) => e.match(/Cannot find module '(.+)'/)[1]);

    if (moduleErrors.length > 0) {
      errorSummary.push("### Module Resolution Errors\n");
      moduleErrors.forEach((module) => {
        errorSummary.push(`- Cannot find module: \`${module}\``);
      });
      errorSummary.push("\n");
    }

    // Client component errors
    const clientErrors =
      buildResult.stderr.match(/"use client" directive.+/g) || [];
    if (clientErrors.length > 0) {
      errorSummary.push("### Client Component Errors\n");
      clientErrors.forEach((error) => {
        errorSummary.push(`- ${error}`);
      });
      errorSummary.push("\n");
    }

    if (errorSummary.length > 0) {
      markdown += "### Error Summary\n\n";
      markdown += errorSummary.join("\n");
      markdown += "\n";
    }
  }

  // Check TypeScript errors
  console.log("Checking TypeScript...");
  markdown += "## TypeScript Status\n\n";
  const tsResult = await checkTypeScript();

  if (tsResult.success) {
    markdown += "✅ No TypeScript errors\n\n";
  } else {
    markdown += `❌ Found ${tsResult.issues.length} TypeScript errors\n\n`;

    if (tsResult.issues.length > 0) {
      markdown += "```\n";
      tsResult.issues.forEach((issue, index) => {
        if (index < 20) {
          // Limit the number of errors shown
          markdown += issue + "\n";
        } else if (index === 20) {
          markdown += `... and ${tsResult.issues.length - 20} more errors\n`;
        }
      });
      markdown += "```\n\n";
    }
  }

  // Run linting
  console.log("Running linting check...");
  markdown += "## Linting Status\n\n";
  const lintResult = await runCommand(config.testCommand);

  if (lintResult.success) {
    markdown += "✅ Linting passed\n\n";
  } else {
    markdown += "❌ Linting failed\n\n";
    markdown += "```\n" + lintResult.stderr + "\n```\n\n";
  }

  // Check dependencies if configured
  if (config.checkDependencies) {
    console.log("Checking dependencies...");
    markdown += "## Dependency Status\n\n";
    const depIssues = await checkPackageDependencies();

    if (depIssues.length === 0) {
      markdown += "✅ No dependency issues found\n\n";
    } else {
      markdown += "❌ Dependency issues found\n\n";
      depIssues.forEach((issue) => {
        markdown += `- ${issue}\n`;
      });
      markdown += "\n";
    }

    // Check npm for outdated packages
    const outdatedResult = await runCommand("npm outdated --json");
    try {
      const outdated = JSON.parse(outdatedResult.stdout || "{}");
      const outdatedPackages = Object.keys(outdated);

      if (outdatedPackages.length > 0) {
        markdown += "### Outdated Packages\n\n";
        markdown += "| Package | Current | Wanted | Latest |\n";
        markdown += "|---------|---------|--------|--------|\n";

        outdatedPackages.forEach((pkg) => {
          const info = outdated[pkg];
          markdown += `| ${pkg} | ${info.current} | ${info.wanted} | ${info.latest} |\n`;
        });

        markdown += "\n";
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }
  }

  // Write the report
  await writeFile(config.outputFile, markdown);
  console.log(`Error report written to ${config.outputFile}`);
}

// Run the generator
generateErrorReport();
