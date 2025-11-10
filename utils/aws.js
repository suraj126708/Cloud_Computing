const AWS = require("aws-sdk");

// Configure AWS SDK
AWS.config.update({
  region: process.env.REGION || "us-east-1",
});

// Initialize AWS services
// Use local DynamoDB when running offline
const dynamodbConfig = {
  region: process.env.REGION || "us-east-1",
};

// If running with serverless-offline, use local DynamoDB
if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
  // For now, disable DynamoDB Local due to installation issues
  // We'll use a mock implementation instead
  console.log("Running in offline mode - using mock DynamoDB");
}

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamodbConfig);
const s3 = new AWS.S3();
const cloudwatch = new AWS.CloudWatchLogs();

// DynamoDB Table Names
const TABLES = {
  USERS: process.env.USERS_TABLE || "youtube-canva-serverless-dev-users",
  DESIGNS: process.env.DESIGNS_TABLE || "youtube-canva-serverless-dev-designs",
  USER_IMAGES:
    process.env.USER_IMAGES_TABLE || "youtube-canva-serverless-dev-user-images",
  DESIGN_IMAGES:
    process.env.DESIGN_IMAGES_TABLE ||
    "youtube-canva-serverless-dev-design-images",
  BACKGROUND_IMAGES:
    process.env.BACKGROUND_IMAGES_TABLE ||
    "youtube-canva-serverless-dev-background-images",
  TEMPLATES:
    process.env.TEMPLATES_TABLE || "youtube-canva-serverless-dev-templates",
};

// S3 Configuration
const S3_BUCKET =
  process.env.S3_BUCKET || "youtube-canva-serverless-dev-images";

// CloudWatch Configuration
const LOG_GROUP_NAME =
  process.env.LOG_GROUP_NAME || "/aws/lambda/canva-serverless";

// In-memory mock for development
const mockDb = {};

// Utility functions for DynamoDB operations
const dbUtils = {
  // Generic CRUD operations
  async get(tableName, key) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      // Mock implementation
      const table = mockDb[tableName] || {};
      const item = table[key.id] || null;
      return { Item: item };
    }

    const params = {
      TableName: tableName,
      Key: key,
    };
    return await dynamodb.get(params).promise();
  },

  async put(tableName, item) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      // Mock implementation
      if (!mockDb[tableName]) {
        mockDb[tableName] = {};
      }
      mockDb[tableName][item.id] = item;
      return { Attributes: item };
    }

    const params = {
      TableName: tableName,
      Item: item,
    };
    return await dynamodb.put(params).promise();
  },

  async update(
    tableName,
    key,
    updateExpression,
    expressionAttributeValues,
    expressionAttributeNames = {}
  ) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      // Mock implementation - simplified
      if (!mockDb[tableName]) {
        mockDb[tableName] = {};
      }
      const existingItem = mockDb[tableName][key.id] || {};
      const updatedItem = {
        ...existingItem,
        ...key,
        updatedAt: new Date().toISOString(),
      };
      mockDb[tableName][key.id] = updatedItem;
      return { Attributes: updatedItem };
    }

    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    };
    return await dynamodb.update(params).promise();
  },

  async delete(tableName, key) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      // Mock implementation
      if (mockDb[tableName] && mockDb[tableName][key.id]) {
        delete mockDb[tableName][key.id];
      }
      return {};
    }

    const params = {
      TableName: tableName,
      Key: key,
    };
    return await dynamodb.delete(params).promise();
  },

  async query(
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    indexName = null
  ) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      // Mock implementation - simplified for email lookup
      const table = mockDb[tableName] || {};
      const items = Object.values(table);

      // Simple email-based query
      if (keyConditionExpression.includes("email")) {
        const email = expressionAttributeValues[":email"];
        const matchingItems = items.filter((item) => item.email === email);
        return { Items: matchingItems };
      }

      return { Items: items };
    }

    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    if (indexName) {
      params.IndexName = indexName;
    }
    return await dynamodb.query(params).promise();
  },

  async scan(
    tableName,
    filterExpression = null,
    expressionAttributeValues = {}
  ) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      // Mock implementation
      const table = mockDb[tableName] || {};
      const items = Object.values(table);
      return { Items: items };
    }

    const params = {
      TableName: tableName,
    };
    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }
    return await dynamodb.scan(params).promise();
  },
};

// S3 Utility functions
const s3Utils = {
  /**
   * Generate an S3 key with a folder prefix
   * @param {string} folder - The folder/prefix (e.g., "designs", "user-images")
   * @param {string} filename - The filename
   * @returns {string} - The full S3 key path
   */
  generateKey(folder, filename) {
    // Remove leading/trailing slashes and ensure clean path
    const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
    const cleanFilename = filename.replace(/^\/+/, "");
    return `${cleanFolder}/${cleanFilename}`;
  },

  async uploadFile(key, body, contentType = "image/jpeg") {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      return {
        Bucket: S3_BUCKET,
        Key: key,
        Location: `https://mock-s3.local/${S3_BUCKET}/${key}`,
      };
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // No ACL here. We rely completely on bucket policy.
    };

    await s3.putObject(params).promise();

    // Return the public URL (works because your bucket policy allows public-read)
    // Construct the S3 URL - S3 handles keys with special characters correctly
    const region = process.env.REGION || "us-east-1";
    const location = `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;

    return {
      Bucket: S3_BUCKET,
      Key: key,
      Location: location,
    };
  },

  async deleteFile(key) {
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
      return {};
    }

    const params = {
      Bucket: S3_BUCKET,
      Key: key,
    };
    return await s3.deleteObject(params).promise();
  },

  /**
   * Extract S3 key from a full S3 URL
   * Handles different URL formats:
   * - https://bucket.s3.region.amazonaws.com/key
   * - https://s3.region.amazonaws.com/bucket/key
   * - https://bucket.s3.amazonaws.com/key
   * @param {string} url - The full S3 URL
   * @returns {string|null} - The S3 key or null if extraction fails
   */
  extractKeyFromUrl(url) {
    if (!url || typeof url !== "string") {
      return null;
    }

    try {
      // Remove protocol and domain, get the path
      const urlObj = new URL(url);
      let key = urlObj.pathname;

      // Remove leading slash
      if (key.startsWith("/")) {
        key = key.substring(1);
      }

      // If the path starts with the bucket name, remove it
      // S3 URLs can be: bucket.s3.amazonaws.com/key or s3.amazonaws.com/bucket/key
      const bucketName = S3_BUCKET;
      if (key.startsWith(bucketName + "/")) {
        key = key.substring(bucketName.length + 1);
      }

      // Decode URL-encoded characters
      key = decodeURIComponent(key);

      return key || null;
    } catch (error) {
      // Fallback: try to extract by splitting
      const parts = url.split("/");
      // Find the bucket name in the URL and get everything after it
      const bucketIndex = parts.findIndex(
        (part) => part.includes(S3_BUCKET) || part.includes("s3")
      );
      if (bucketIndex !== -1 && bucketIndex < parts.length - 1) {
        return parts.slice(bucketIndex + 1).join("/");
      }
      // Last resort: return the last part
      return parts[parts.length - 1] || null;
    }
  },
};

// CloudWatch logging utilities
const logger = {
  async log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      service: "canva-serverless",
    };

    console.log(JSON.stringify(logEntry));

    // Send to CloudWatch if in production
    if (process.env.NODE_ENV === "production") {
      try {
        await cloudwatch
          .putLogEvents({
            logGroupName: LOG_GROUP_NAME,
            logStreamName: `${new Date().toISOString().split("T")[0]}-${
              process.env.AWS_LAMBDA_FUNCTION_NAME || "unknown"
            }`,
            logEvents: [
              {
                timestamp: Date.now(),
                message: JSON.stringify(logEntry),
              },
            ],
          })
          .promise();
      } catch (error) {
        console.error("Failed to send log to CloudWatch:", error);
      }
    }
  },

  info(message, data) {
    return this.log("INFO", message, data);
  },

  error(message, data) {
    return this.log("ERROR", message, data);
  },

  warn(message, data) {
    return this.log("WARN", message, data);
  },

  debug(message, data) {
    return this.log("DEBUG", message, data);
  },
};

// Response utility functions
const response = {
  success(data, statusCode = 200) {
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data,
      }),
    };
  },

  error(message, statusCode = 500, error = null) {
    logger.error(message, { error: error?.message || error });
    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message,
        error: error?.message || null,
      }),
    };
  },
};

module.exports = {
  AWS,
  dynamodb,
  s3,
  cloudwatch,
  TABLES,
  S3_BUCKET,
  dbUtils,
  s3Utils,
  logger,
  response,
};
