/**
 * Script to create a Sharp Lambda layer package
 * This builds Sharp for Linux and packages it in the correct Lambda layer structure
 */

const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const tar = require("tar");

const execAsync = promisify(exec);

const LAYER_DIR = path.join(__dirname, "../layer");
const LAYER_NODEJS_DIR = path.join(__dirname, "../layer/nodejs");
const LAYER_NODE_MODULES_DIR = path.join(
  __dirname,
  "../layer/nodejs/node_modules"
);
const LAYER_ZIP = path.join(__dirname, "../sharp-layer.zip");

console.log("Creating Sharp Lambda layer package...");
console.log("Current platform:", os.platform(), os.arch());
console.log("");

function checkDocker() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function buildWithDocker() {
  console.log("🐳 Using Docker to build Sharp for Lambda layer...");
  console.log("");

  // Clean up existing layer directory
  if (fs.existsSync(LAYER_DIR)) {
    console.log("Cleaning up existing layer directory...");
    fs.rmSync(LAYER_DIR, { recursive: true, force: true });
  }

  // Create layer directory structure
  fs.mkdirSync(LAYER_NODE_MODULES_DIR, { recursive: true });

  // Create a temporary Dockerfile that installs Sharp and creates a tar file
  const dockerfile = `
FROM public.ecr.aws/lambda/nodejs:18
WORKDIR /var/task
RUN yum install -y tar gzip && \
    npm install --production sharp@latest && \
    tar -czf /var/task/node_modules.tar.gz node_modules
`;

  const dockerfilePath = path.join(__dirname, "../Dockerfile.layer");
  fs.writeFileSync(dockerfilePath, dockerfile);

  try {
    console.log("Building Docker image...");
    execSync("docker build -f Dockerfile.layer -t sharp-layer-builder .", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    console.log("Extracting Sharp from container...");

    // Ensure destination directory exists
    if (!fs.existsSync(LAYER_NODE_MODULES_DIR)) {
      fs.mkdirSync(LAYER_NODE_MODULES_DIR, { recursive: true });
    }

    // Copy entire node_modules from container to layer structure
    // This includes Sharp and all its dependencies (like detect-libc)
    const containerId = execSync("docker create sharp-layer-builder")
      .toString()
      .trim();

    try {
      // Copy tar file from container and extract using Node.js tar library
      // This avoids Windows symlink and tar command issues
      console.log("Extracting node_modules from container...");

      const tarPath = path.join(__dirname, "../node_modules.tar.gz");
      const dockerCpTarCommand =
        os.platform() === "win32"
          ? `docker cp "${containerId}:/var/task/node_modules.tar.gz" "${tarPath}"`
          : `docker cp ${containerId}:/var/task/node_modules.tar.gz ${tarPath}`;

      execSync(dockerCpTarCommand, { stdio: "inherit" });

      // Extract the tar file using Node.js tar library (handles symlinks properly)
      const parentDestPath = path.normalize(
        path.dirname(LAYER_NODE_MODULES_DIR)
      );

      console.log("Extracting tar file...");
      await tar.extract({
        file: tarPath,
        cwd: parentDestPath,
        strip: 0, // Keep the node_modules directory structure
      });

      // Clean up tar file
      if (fs.existsSync(tarPath)) {
        fs.unlinkSync(tarPath);
      }

      // Check if Sharp and its dependencies were copied
      const sharpPath = path.join(LAYER_NODE_MODULES_DIR, "sharp");
      const detectLibcPath = path.join(LAYER_NODE_MODULES_DIR, "detect-libc");

      if (!fs.existsSync(sharpPath)) {
        throw new Error(
          "Failed to copy Sharp - Sharp directory not found after extraction"
        );
      }

      // Verify Sharp's critical dependencies were copied
      if (!fs.existsSync(detectLibcPath)) {
        console.log("⚠️  detect-libc not found - this may cause issues");
        console.log("   Checking for other Sharp dependencies...");

        // List what was actually copied
        const copiedModules = fs.readdirSync(LAYER_NODE_MODULES_DIR);
        console.log(
          `   Found ${copiedModules.length} packages in node_modules`
        );

        // Try to install missing dependencies
        console.log("   Installing missing Sharp dependencies...");
        const tempPackageJson = path.join(LAYER_NODEJS_DIR, "package.json");
        fs.writeFileSync(
          tempPackageJson,
          JSON.stringify({
            name: "sharp-layer-deps",
            version: "1.0.0",
            dependencies: {
              "detect-libc": "^2.0.1",
            },
          })
        );

        try {
          execSync("npm install --production", {
            stdio: "inherit",
            cwd: LAYER_NODEJS_DIR,
          });
          fs.unlinkSync(tempPackageJson);
          if (fs.existsSync(path.join(LAYER_NODEJS_DIR, "package-lock.json"))) {
            fs.unlinkSync(path.join(LAYER_NODEJS_DIR, "package-lock.json"));
          }
        } catch (installError) {
          console.log("⚠️  Could not install detect-libc automatically");
          console.log(
            "   The layer may still work if detect-libc is available in Lambda runtime"
          );
        }
      }
    } finally {
      execSync(`docker rm ${containerId}`, { stdio: "ignore" });
    }

    console.log("");
    console.log("✅ Sharp extracted successfully!");
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

async function buildOnLinux() {
  console.log("✅ Already on Linux x64, building Sharp...");

  // Clean up existing layer directory
  if (fs.existsSync(LAYER_DIR)) {
    fs.rmSync(LAYER_DIR, { recursive: true, force: true });
  }

  // Create layer directory structure
  fs.mkdirSync(LAYER_NODE_MODULES_DIR, { recursive: true });

  // Create temporary package.json for Sharp installation
  const tempPackageJson = path.join(LAYER_NODEJS_DIR, "package.json");
  fs.writeFileSync(
    tempPackageJson,
    JSON.stringify({
      name: "sharp-layer",
      version: "1.0.0",
      dependencies: {
        sharp: "latest",
      },
    })
  );

  try {
    console.log("Installing Sharp in layer directory...");
    execSync("npm install --production", {
      stdio: "inherit",
      cwd: LAYER_NODEJS_DIR,
    });

    // Clean up package.json
    fs.unlinkSync(tempPackageJson);
    if (fs.existsSync(path.join(LAYER_NODEJS_DIR, "package-lock.json"))) {
      fs.unlinkSync(path.join(LAYER_NODEJS_DIR, "package-lock.json"));
    }

    console.log("✅ Sharp built successfully!");
    return true;
  } catch (error) {
    console.error("");
    console.error("❌ Build failed:", error.message);
    return false;
  }
}

async function createZipFile() {
  // Check if archiver is available (for Windows zip creation)
  let archiver;
  try {
    archiver = require("archiver");
  } catch {
    archiver = null;
  }
  console.log("");
  console.log("Creating layer zip file...");

  // Remove existing zip
  if (fs.existsSync(LAYER_ZIP)) {
    fs.unlinkSync(LAYER_ZIP);
  }

  try {
    // Use zip command if available, otherwise provide instructions
    if (os.platform() === "win32") {
      // On Windows, PowerShell Compress-Archive creates Windows-style paths with backslashes
      // Lambda requires Unix-style paths with forward slashes
      // Use a Node.js-based solution to create proper zip files
      if (archiver) {
        const output = fs.createWriteStream(LAYER_ZIP);
        const archive = archiver("zip", { zlib: { level: 9 } });

        await new Promise((resolve, reject) => {
          output.on("close", () => {
            const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
            console.log(`Archive created: ${sizeMB} MB`);
            resolve(true);
          });

          archive.on("error", (err) => {
            reject(err);
          });

          archive.pipe(output);

          // Add the nodejs directory with proper Unix paths
          archive.directory(LAYER_NODEJS_DIR, "nodejs");
          archive.finalize();
        });
      } else {
        // Fallback to other methods
        const layerDir = path.normalize(LAYER_DIR);
        const zipPath = path.normalize(LAYER_ZIP);

        // Try 7zip if available
        try {
          execSync("7z --version", { stdio: "ignore" });
          execSync(`cd "${layerDir}" && 7z a -tzip "${zipPath}" nodejs -r`, {
            stdio: "inherit",
            shell: true,
          });
        } catch (error) {
          console.log("");
          console.log(
            "⚠️  Could not create zip with 7zip. Please install 7zip or use manual method."
          );
          throw error;
        }
      }
    } else {
      // On Linux/Mac, use zip command
      execSync(`cd ${LAYER_DIR} && zip -r ../sharp-layer.zip nodejs/`, {
        stdio: "inherit",
      });
    }
  } catch (error) {
    console.log("");
    console.log("⚠️  Could not create zip automatically on Windows.");
    console.log("   Please manually create the zip file:");
    console.log(`   1. Navigate to: ${LAYER_DIR}`);
    console.log("   2. Zip the 'nodejs' folder (not its contents)");
    console.log(`   3. Save as: ${LAYER_ZIP}`);
    console.log("");
    console.log("   The zip structure should be:");
    console.log("   sharp-layer.zip");
    console.log("     └── nodejs/");
    console.log("         └── node_modules/");
    console.log("             └── sharp/");
    return false;
  }

  const stats = fs.statSync(LAYER_ZIP);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log("");
  console.log(`✅ Layer zip created: ${LAYER_ZIP}`);
  console.log(`   Size: ${sizeMB} MB`);
  return true;
}

async function main() {
  let buildSuccess = false;

  if (os.platform() === "linux" && os.arch() === "x64") {
    buildSuccess = await buildOnLinux();
  } else if (checkDocker()) {
    buildSuccess = await buildWithDocker();
  } else {
    console.log("");
    console.log(
      "⚠️  Docker not available. Lambda layers require Linux binaries."
    );
    console.log("");
    console.log("   RECOMMENDED: Install Docker Desktop");
    console.log("   - Windows: https://www.docker.com/products/docker-desktop");
    console.log("   - Mac: https://www.docker.com/products/docker-desktop");
    console.log("   Then run this script again.");
    console.log("");
    console.log(
      "   ALTERNATIVE: Use WSL2 on Windows or deploy from a Linux machine"
    );
    console.log("");
    process.exit(1);
  }

  if (!buildSuccess) {
    console.log("");
    console.log("❌ Failed to build Sharp layer");
    process.exit(1);
  }

  // Verify Sharp was installed
  const sharpPath = path.join(LAYER_NODE_MODULES_DIR, "sharp");
  if (!fs.existsSync(sharpPath)) {
    console.error("");
    console.error("❌ Sharp was not installed in layer directory");
    process.exit(1);
  }

  // Create zip file
  const zipSuccess = await createZipFile();

  if (zipSuccess) {
    console.log("");
    console.log("========================================");
    console.log("✅ Sharp layer package created!");
    console.log("========================================");
    console.log("");
    console.log("Next step: Run 'npm run deploy-layer' to deploy to AWS");
    console.log("");
  } else {
    console.log("");
    console.log("⚠️  Layer directory created but zip file creation failed.");
    console.log(
      "   Please create the zip manually and then run deploy-layer script."
    );
    console.log("");
  }
}

main().catch((error) => {
  console.error("");
  console.error("❌ Error creating Sharp layer:", error.message);
  console.error("");
  process.exit(1);
});
