// Import Sharp with error handling
let sharp;
let sharpAvailable = false;
try {
  sharp = require("sharp");
  // Verify Sharp is actually working by checking if it has the expected methods
  if (sharp && typeof sharp === "function") {
    sharpAvailable = true;
  } else {
    sharpAvailable = false;
  }
} catch (error) {
  sharpAvailable = false;
  sharp = null;
}

const userImageModel = require("../models/userImageModel.js");
const designImageModel = require("../models/designImageModel.js");
const backgroundImageModel = require("../models/backgroundImageModel.js");
const { response, logger, s3Utils } = require("../utils/aws.js");
const auth = require("../middlewares/middleware.js");

const addUserImage = async (event) => {
  try {
    logger.info("Add user image attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;

    // Parse JSON data - handle header case variations
    const normalizedHeaders = Object.fromEntries(
      Object.entries(event.headers || {}).map(([key, value]) => [
        String(key).toLowerCase(),
        value,
      ])
    );
    const contentType = normalizedHeaders["content-type"] || "";
    if (!contentType.includes("application/json")) {
      return response.error("Content-Type must be application/json", 400);
    }

    // Parse JSON body - handle both string and already parsed
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || {};
    let { imageData } = body;

    // Accept data URLs and raw base64
    if (typeof imageData === "string" && imageData.includes(",")) {
      imageData = imageData.split(",").pop();
    }

    if (!imageData) {
      return response.error("Image data is required", 400);
    }

    // Check if Sharp is available
    if (!sharpAvailable || !sharp) {
      logger.error("Sharp is not available - cannot process image");
      return response.error(
        "Image processing service unavailable. Sharp library not loaded.",
        500
      );
    }

    // Process image with Sharp
    let imageBuffer;
    try {
      imageBuffer = Buffer.from(imageData, "base64");
    } catch (error) {
      logger.error("Failed to create buffer from imageData", {
        error: error.message,
      });
      return response.error("Invalid image data format", 400);
    }

    let processedImage;
    try {
      processedImage = await sharp(imageBuffer)
        .resize(800, 600, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error) {
      logger.error("Sharp processing error", {
        error: error.message,
        stack: error.stack,
      });
      return response.error("Failed to process image with Sharp", 500);
    }

    // Upload to S3
    const imageKey = s3Utils.generateKey(
      "user-images",
      `${_id}-${Date.now()}.jpg`
    );
    const uploadResult = await s3Utils.uploadFile(
      imageKey,
      processedImage,
      "image/jpeg"
    );

    // Create user image record
    const userImage = await userImageModel.create({
      user_id: _id,
      image_url: uploadResult.Location,
    });

    logger.info("User image added successfully", {
      imageId: userImage.id,
      userId: _id,
    });
    return response.success({ userImage }, 201);
  } catch (error) {
    logger.error("Add user image error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const getUserImages = async (event) => {
  try {
    logger.info("Get user images attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;
    const images = await userImageModel.findByUserId(_id);

    logger.info("User images retrieved successfully", {
      userId: _id,
      count: images.length,
    });
    return response.success({ images });
  } catch (error) {
    logger.error("Get user images error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const getDesignImages = async (event) => {
  try {
    logger.info("Get design images attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const images = await designImageModel.findAll();

    logger.info("Design images retrieved successfully", {
      count: images.length,
    });
    return response.success({ images });
  } catch (error) {
    logger.error("Get design images error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const getBackgroundImages = async (event) => {
  try {
    logger.info("Get background images attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const images = await backgroundImageModel.findAll();

    logger.info("Background images retrieved successfully", {
      count: images.length,
    });
    return response.success({ images });
  } catch (error) {
    logger.error("Get background images error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

module.exports = {
  addUserImage,
  getUserImages,
  getDesignImages,
  getBackgroundImages,
};
