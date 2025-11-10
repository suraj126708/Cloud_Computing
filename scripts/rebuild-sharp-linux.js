/**
 * Script to rebuild sharp for Linux (AWS Lambda)
 * Run this before deploying to AWS Lambda
 *
 * This script uses Docker to build sharp for Linux if Docker is available,
 * otherwise it provides instructions for manual setup.
 */

const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

console.log("Rebuilding sharp for Linux (AWS Lambda)...");
console.log("Current platform:", os.platform(), os.arch());

function checkDocker() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function buildWithDocker() {
  console.log("🐳 Using Docker to build sharp for Linux...");
  console.log("");

  // Remove existing sharp to ensure clean build
  const sharpPath = path.join(__dirname, "../node_modules/sharp");
  if (fs.existsSync(sharpPath)) {
    console.log("Removing existing sharp installation...");
    try {
      fs.rmSync(sharpPath, { recursive: true, force: true });
    } catch (error) {
      console.warn("Warning: Could not remove existing sharp:", error.message);
    }
  }

  // Create a temporary Dockerfile
  const dockerfile = `
FROM public.ecr.aws/lambda/nodejs:18
WORKDIR /var/task
COPY package*.json ./
RUN npm install --production sharp@latest
`;

  const dockerfilePath = path.join(__dirname, "../Dockerfile.sharp");
  fs.writeFileSync(dockerfilePath, dockerfile);

  try {
    console.log("Building Docker image...");
    // Build in Docker container
    execSync("docker build -f Dockerfile.sharp -t sharp-builder .", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    console.log("Extracting sharp from container...");
    // Copy node_modules/sharp from container
    const containerId = execSync("docker create sharp-builder")
      .toString()
      .trim();

    // Ensure node_modules exists
    const nodeModulesPath = path.join(__dirname, "../node_modules");
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath, { recursive: true });
    }

    execSync(
      `docker cp ${containerId}:/var/task/node_modules/sharp ./node_modules/`,
      {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      }
    );
    execSync(`docker rm ${containerId}`, { stdio: "ignore" });

    console.log("");
    console.log("✅ Sharp rebuilt successfully using Docker!");
    console.log(
      "   The Linux-compatible Sharp binaries are now in node_modules/sharp"
    );
    return true;
  } catch (error) {
    console.error("");
    console.error("❌ Docker build failed:", error.message);
    return false;
  } finally {
    // Cleanup
    try {
      if (fs.existsSync(dockerfilePath)) {
        fs.unlinkSync(dockerfilePath);
      }
    } catch {}
  }
}

try {
  if (os.platform() === "linux" && os.arch() === "x64") {
    console.log("✅ Already on Linux x64, rebuilding sharp...");
    execSync("npm rebuild sharp", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("✅ Sharp rebuilt successfully!");
  } else if (checkDocker()) {
    if (!buildWithDocker()) {
      console.log("");
      console.log("⚠️  Docker build failed. Please try one of these options:");
      console.log("");
      console.log("   Option 1: Install Docker Desktop (Windows/Mac)");
      console.log("            https://www.docker.com/products/docker-desktop");
      console.log("");
      console.log("   Option 2: Use WSL2 on Windows");
      console.log("            Run: wsl");
      console.log("            Then: npm install sharp");
      console.log("");
      console.log("   Option 3: Deploy from a Linux machine/CI");
      console.log("");
      console.log("   Option 4: Use AWS Lambda Layers");
      console.log("            Create a layer with sharp for Linux");
      console.log("");
      process.exit(1);
    }
  } else {
    console.log("");
    console.log("⚠️  Docker not available. For AWS Lambda deployment:");
    console.log("");
    console.log("   RECOMMENDED: Install Docker Desktop");
    console.log("   - Windows: https://www.docker.com/products/docker-desktop");
    console.log("   - Mac: https://www.docker.com/products/docker-desktop");
    console.log("   Then run this script again.");
    console.log("");
    console.log("   ALTERNATIVE OPTIONS:");
    console.log("   1. Use WSL2 on Windows:");
    console.log("      wsl");
    console.log("      npm install sharp");
    console.log("");
    console.log("   2. Deploy from a Linux machine or CI/CD");
    console.log("");
    console.log("   3. Use AWS Lambda Layers");
    console.log("");

    // Still try to rebuild, might work if binaries are compatible
    console.log("⚠️  Attempting to rebuild sharp (may not work on Lambda)...");
    console.log("");
    try {
      execSync("npm rebuild sharp", {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
      console.log("");
      console.log(
        "⚠️  Rebuild completed, but binaries may not work on Lambda."
      );
      console.log(
        "   Please test your deployment or use Docker/WSL2 for reliable builds."
      );
      console.log("");
    } catch (error) {
      console.error("");
      console.error("❌ Rebuild failed. Please use one of the options above.");
      console.error("");
      process.exit(1);
    }
  }

  console.log("");
  console.log("========================================");
  console.log("✅ Sharp rebuild process completed!");
  console.log("========================================");
  console.log("");
} catch (error) {
  console.error("");
  console.error("❌ Error rebuilding sharp:", error.message);
  console.error("");
  process.exit(1);
}
