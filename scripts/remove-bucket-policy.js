/**
 * Script to remove existing S3 bucket policy
 * This is needed when a bucket policy exists outside CloudFormation
 */

const AWS = require("aws-sdk");
const path = require("path");

// Try to load .env if it exists
try {
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
} catch (e) {
  // dotenv not available or .env doesn't exist, continue without it
}

const REGION = process.env.AWS_REGION || "us-east-1";
const STAGE = process.env.STAGE || process.argv[2] || "dev";
const BUCKET_NAME = `youtube-canva-serverless-${STAGE}-images`;

// Configure AWS SDK
AWS.config.update({ region: REGION });
const s3 = new AWS.S3();

async function removeBucketPolicy() {
  console.log(`Removing bucket policy from: ${BUCKET_NAME}`);
  console.log(`Region: ${REGION}`);
  console.log("");

  try {
    // Check if bucket exists
    try {
      await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
      console.log("✅ Bucket exists");
    } catch (error) {
      if (error.code === "NotFound") {
        console.error(`❌ Bucket ${BUCKET_NAME} does not exist`);
        process.exit(1);
      }
      throw error;
    }

    // Try to get existing policy
    try {
      const policy = await s3.getBucketPolicy({ Bucket: BUCKET_NAME }).promise();
      console.log("📋 Found existing bucket policy");
      console.log("");
    } catch (error) {
      if (error.code === "NoSuchBucketPolicy") {
        console.log("ℹ️  No existing bucket policy found - nothing to remove");
        console.log("✅ You can proceed with deployment");
        process.exit(0);
      }
      throw error;
    }

    // Delete the policy
    await s3.deleteBucketPolicy({ Bucket: BUCKET_NAME }).promise();
    console.log("✅ Bucket policy removed successfully");
    console.log("");
    console.log("You can now run: npm run deploy:dev");
  } catch (error) {
    console.error("");
    console.error("❌ Error removing bucket policy:", error.message);
    if (error.code === "AccessDenied") {
      console.error("");
      console.error("   Your AWS credentials don't have permission to delete bucket policies.");
      console.error("   Required permission: s3:DeleteBucketPolicy");
    }
    console.error("");
    process.exit(1);
  }
}

removeBucketPolicy();

