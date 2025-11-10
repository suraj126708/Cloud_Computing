/**
 * Script to deploy Sharp Lambda layer to AWS
 * This uploads the layer zip file to AWS Lambda and outputs the layer ARN
 */

const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const os = require("os");

const LAYER_ZIP = path.join(__dirname, "../sharp-layer.zip");
const LAYER_NAME = "sharp";
const REGION = process.env.AWS_REGION || "us-east-1";

// Configure AWS SDK
AWS.config.update({ region: REGION });
const lambda = new AWS.Lambda();

async function deployLayer() {
  console.log("Deploying Sharp Lambda layer to AWS...");
  console.log(`Region: ${REGION}`);
  console.log(`Layer name: ${LAYER_NAME}`);
  console.log("");

  // Check if zip file exists
  if (!fs.existsSync(LAYER_ZIP)) {
    console.error("❌ Layer zip file not found!");
    console.error(`   Expected: ${LAYER_ZIP}`);
    console.error("");
    console.error("   Please run 'npm run create-layer' first to build the layer.");
    process.exit(1);
  }

  const zipStats = fs.statSync(LAYER_ZIP);
  const sizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
  console.log(`Layer zip file: ${LAYER_ZIP}`);
  console.log(`Size: ${sizeMB} MB`);
  console.log("");

  // Read zip file
  const zipBuffer = fs.readFileSync(LAYER_ZIP);

  try {
    // Check if layer already exists
    let layerVersion = null;
    try {
      const existingLayers = await lambda
        .listLayerVersions({ LayerName: LAYER_NAME })
        .promise();

      if (existingLayers.LayerVersions && existingLayers.LayerVersions.length > 0) {
        const latestVersion = existingLayers.LayerVersions[0];
        console.log(`Found existing layer version: ${latestVersion.Version}`);
        console.log("");
      }
    } catch (error) {
      if (error.code !== "ResourceNotFoundException") {
        throw error;
      }
      console.log("Creating new layer...");
      console.log("");
    }

    // Publish new layer version
    console.log("Uploading layer to AWS Lambda...");
    const params = {
      LayerName: LAYER_NAME,
      Description: "Sharp image processing library for Node.js 18.x",
      Content: {
        ZipFile: zipBuffer,
      },
      CompatibleRuntimes: ["nodejs18.x"],
    };

    const result = await lambda.publishLayerVersion(params).promise();

    console.log("");
    console.log("========================================");
    console.log("✅ Layer deployed successfully!");
    console.log("========================================");
    console.log("");
    console.log("Layer ARN:", result.LayerVersionArn);
    console.log("Version:", result.Version);
    console.log("");
    console.log("To use this layer, set the SHARP_LAYER_ARN environment variable:");
    console.log("");
    if (os.platform() === "win32") {
      console.log("  Windows (PowerShell):");
      console.log(`    $env:SHARP_LAYER_ARN="${result.LayerVersionArn}"`);
      console.log("");
      console.log("  Windows (CMD):");
      console.log(`    set SHARP_LAYER_ARN=${result.LayerVersionArn}`);
    } else {
      console.log("  Linux/Mac:");
      console.log(`    export SHARP_LAYER_ARN="${result.LayerVersionArn}"`);
    }
    console.log("");
    console.log("Or add it to your .env file:");
    console.log(`  SHARP_LAYER_ARN=${result.LayerVersionArn}`);
    console.log("");

    // Save ARN to a file for easy reference
    const arnFile = path.join(__dirname, "../.sharp-layer-arn");
    fs.writeFileSync(arnFile, result.LayerVersionArn);
    console.log(`Layer ARN saved to: ${arnFile}`);
    console.log("");

    return result.LayerVersionArn;
  } catch (error) {
    console.error("");
    console.error("❌ Failed to deploy layer:", error.message);
    if (error.code === "AccessDeniedException") {
      console.error("");
      console.error("   Your AWS credentials don't have permission to create Lambda layers.");
      console.error("   Required permissions:");
      console.error("   - lambda:PublishLayerVersion");
      console.error("   - lambda:GetLayerVersion");
      console.error("   - lambda:ListLayerVersions");
    }
    console.error("");
    process.exit(1);
  }
}

// Get AWS account ID for verification
async function getAccountId() {
  try {
    const sts = new AWS.STS();
    const identity = await sts.getCallerIdentity().promise();
    return identity.Account;
  } catch (error) {
    console.warn("⚠️  Could not verify AWS account ID:", error.message);
    return null;
  }
}

async function main() {
  const accountId = await getAccountId();
  if (accountId) {
    console.log(`AWS Account: ${accountId}`);
    console.log("");
  }

  await deployLayer();
}

main().catch((error) => {
  console.error("");
  console.error("❌ Error deploying layer:", error.message);
  console.error("");
  process.exit(1);
});

