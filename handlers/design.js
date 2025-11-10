const designModel = require("../models/designModel");
const userImageModel = require("../models/userImageModel");
const designImageModel = require("../models/designImageModel");
const backgroundImageModel = require("../models/backgroundImageModel");
const templateModel = require("../models/templateModel");
const { response, logger, s3Utils } = require("../utils/aws");
const auth = require("../middlewares/middleware");

// Import Sharp with error handling
// Lambda layers automatically mount at /opt/nodejs/node_modules
// Node.js should automatically resolve modules from there
let sharp;
let sharpAvailable = false;

try {
  // Standard require - Node.js will automatically look in /opt/nodejs/node_modules
  // when a layer is attached
  sharp = require("sharp");
  
  // Verify Sharp is actually working by checking if it has the expected methods
  if (sharp && typeof sharp === "function") {
    sharpAvailable = true;
    logger.info("Sharp library loaded successfully");
  } else {
    logger.error("Sharp library loaded but is not a function", { 
      sharpType: typeof sharp,
      sharpValue: sharp 
    });
    sharpAvailable = false;
  }
} catch (error) {
  // Enhanced error logging to diagnose layer issues
  const fs = require("fs");
  const path = require("path");
  
  // Check if layer paths exist
  const layerPaths = ["/opt/nodejs/node_modules/sharp", "/opt/nodejs/node_modules"];
  const pathChecks = {};
  
  for (const layerPath of layerPaths) {
    try {
      pathChecks[layerPath] = fs.existsSync(layerPath);
      if (fs.existsSync(layerPath)) {
        const stats = fs.statSync(layerPath);
        pathChecks[`${layerPath}_isDirectory`] = stats.isDirectory();
        if (stats.isDirectory()) {
          pathChecks[`${layerPath}_contents`] = fs.readdirSync(layerPath).slice(0, 5);
        }
      }
    } catch (checkError) {
      pathChecks[`${layerPath}_error`] = checkError.message;
    }
  }
  
  logger.error("Sharp library not available:", error.message);
  logger.error("Sharp error details:", {
    message: error.message,
    stack: error.stack,
    code: error.code,
    path: error.path,
    nodePath: process.env.NODE_PATH || "not set",
    cwd: process.cwd(),
    layerPathChecks: pathChecks,
  });
  
  sharpAvailable = false;
  sharp = null;
}

const createUserDesign = async (event) => {
  try {
    logger.info("Create user design attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;

    // Parse JSON data - handle header casing differences
    const normalizedHeaders = Object.fromEntries(
      Object.entries(event.headers || {}).map(([key, value]) => [
        String(key).toLowerCase(),
        value,
      ])
    );
    const contentType = normalizedHeaders["content-type"] || "";
    // Proceed as long as body is JSON or already parsed by the runtime
    if (
      contentType &&
      !String(contentType).toLowerCase().includes("application/json")
    ) {
      // Allow charsets and missing header in offline mode; only block clearly non-JSON
      // If it's not JSON and not empty, continue – serverless-offline may already parse
    }

    // Parse JSON body
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || {};
    let { imageData, design } = body;

    // Accept data URLs and raw base64
    if (typeof imageData === "string" && imageData.includes(",")) {
      imageData = imageData.split(",").pop();
    }

    // Accept stringified or object design
    let parsedDesign;
    try {
      parsedDesign =
        typeof design === "string" ? JSON.parse(design) : design;
    } catch (parseError) {
      logger.error("Failed to parse design JSON", {
        error: parseError.message,
        designType: typeof design,
      });
      return response.error("Invalid design format: must be valid JSON", 400);
    }

    if (!imageData || !parsedDesign) {
      return response.error(
        !imageData && !parsedDesign
          ? "Image data and design are required"
          : !imageData
          ? "Image data is required"
          : "Design is required",
        400
      );
    }

    // Validate parsedDesign is an object or array
    if (typeof parsedDesign !== "object" || parsedDesign === null) {
      return response.error("Design must be an object or array", 400);
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
    const imageBuffer = Buffer.from(imageData, "base64");
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
    const imageKey = s3Utils.generateKey("designs", `${_id}-${Date.now()}.jpg`);
    const uploadResult = await s3Utils.uploadFile(
      imageKey,
      processedImage,
      "image/jpeg"
    );

    // Create design record
    const designData = await designModel.create({
      user_id: _id,
      components: Array.isArray(parsedDesign) ? parsedDesign : [parsedDesign],
      image_url: uploadResult.Location,
    });

    logger.info("User design created successfully", {
      designId: designData.id,
      userId: _id,
    });
    return response.success({ design: designData });
  } catch (error) {
    logger.error("Create user design error", { 
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return response.error("Internal server error", 500, error);
  }
};

const updateUserDesign = async (event) => {
  try {
    logger.info("Update user design attempt", {
      pathParameters: event.pathParameters,
    });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { design_id } = event.pathParameters || {};
    if (!design_id) {
      return response.error("Design ID is required", 400);
    }

    // Parse JSON data - handle header casing differences and already parsed bodies
    const normalizedHeaders = Object.fromEntries(
      Object.entries(event.headers || {}).map(([key, value]) => [
        String(key).toLowerCase(),
        value,
      ])
    );
    const contentType = normalizedHeaders["content-type"] || "";
    if (
      contentType &&
      !String(contentType).toLowerCase().includes("application/json")
    ) {
      return response.error("Content-Type must be application/json", 400);
    }

    // Parse JSON body - handle both string and already parsed
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body || "{}")
        : event.body || {};
    let { imageData, design } = body;

    // Accept data URLs and raw base64
    if (typeof imageData === "string" && imageData.includes(",")) {
      imageData = imageData.split(",").pop();
    }

    // Accept stringified or object design
    let parsedDesign;
    try {
      parsedDesign =
        typeof design === "string" ? JSON.parse(design) : design;
    } catch (parseError) {
      logger.error("Failed to parse design JSON", {
        error: parseError.message,
        designType: typeof design,
      });
      return response.error("Invalid design format: must be valid JSON", 400);
    }

    if (!imageData || !parsedDesign) {
      return response.error(
        !imageData && !parsedDesign
          ? "Image data and design are required"
          : !imageData
          ? "Image data is required"
          : "Design is required",
        400
      );
    }

    // Validate parsedDesign is an object or array
    if (typeof parsedDesign !== "object" || parsedDesign === null) {
      return response.error("Design must be an object or array", 400);
    }

    const { _id } = authResult.userInfo;

    // Get existing design
    const existingDesign = await designModel.findById(design_id);
    if (!existingDesign) {
      return response.error("Design not found", 404);
    }

    // Verify ownership
    if (existingDesign.user_id !== _id) {
      logger.warn("Unauthorized design update attempt", {
        designId: design_id,
        userId: _id,
        ownerId: existingDesign.user_id,
      });
      return response.error("Unauthorized: You can only update your own designs", 403);
    }

    // Delete old image from S3 if exists
    if (existingDesign.image_url) {
      try {
        const imageKey = s3Utils.extractKeyFromUrl(existingDesign.image_url);
        if (imageKey) {
          await s3Utils.deleteFile(imageKey);
        }
      } catch (error) {
        logger.warn("Failed to delete old image from S3", {
          error: error.message,
        });
      }
    }

    // Process new image with Sharp
    let imageBuffer;
    try {
      imageBuffer = Buffer.from(imageData, "base64");
    } catch (error) {
      logger.error("Failed to create buffer from imageData", {
        error: error.message,
      });
      return response.error("Invalid image data format", 400);
    }

    // Check if Sharp is available
    if (!sharpAvailable || !sharp) {
      logger.error("Sharp is not available - cannot process image");
      return response.error(
        "Image processing service unavailable. Sharp library not loaded.",
        500
      );
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

    // Upload new image to S3
    const imageKey = s3Utils.generateKey(
      "designs",
      `${existingDesign.user_id}-${Date.now()}.jpg`
    );
    const uploadResult = await s3Utils.uploadFile(
      imageKey,
      processedImage,
      "image/jpeg"
    );

    // Update design record
    await designModel.update(design_id, {
      image_url: uploadResult.Location,
      components: Array.isArray(parsedDesign) ? parsedDesign : [parsedDesign],
    });

    logger.info("User design updated successfully", { designId: design_id });
    return response.success({ message: "Image save success" });
  } catch (error) {
    logger.error("Update user design error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const getUserDesign = async (event) => {
  try {
    logger.info("Get user design attempt", {
      pathParameters: event.pathParameters,
    });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;
    const { design_id } = event.pathParameters || {};
    if (!design_id) {
      return response.error("Design ID is required", 400);
    }

    const design = await designModel.findById(design_id);
    if (!design) {
      return response.error("Design not found", 404);
    }

    // Verify ownership
    if (design.user_id !== _id) {
      logger.warn("Unauthorized design access attempt", {
        designId: design_id,
        userId: _id,
        ownerId: design.user_id,
      });
      return response.error("Unauthorized: You can only access your own designs", 403);
    }

    logger.info("User design retrieved successfully", { designId: design_id });
    return response.success({ design: design.components });
  } catch (error) {
    logger.error("Get user design error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const getUserDesigns = async (event) => {
  try {
    logger.info("Get user designs attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;
    const designs = await designModel.findByUserId(_id);

    logger.info("User designs retrieved successfully", {
      userId: _id,
      count: designs.length,
    });
    return response.success({ designs });
  } catch (error) {
    logger.error("Get user designs error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const deleteUserDesign = async (event) => {
  try {
    logger.info("Delete user design attempt", {
      pathParameters: event.pathParameters,
    });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;
    const { design_id } = event.pathParameters || {};
    if (!design_id) {
      return response.error("Design ID is required", 400);
    }

    // Get design to check ownership and get image URL
    const design = await designModel.findById(design_id);
    if (!design) {
      return response.error("Design not found", 404);
    }

    // Verify ownership
    if (design.user_id !== _id) {
      logger.warn("Unauthorized design deletion attempt", {
        designId: design_id,
        userId: _id,
        ownerId: design.user_id,
      });
      return response.error("Unauthorized: You can only delete your own designs", 403);
    }

    // Delete image from S3 if exists
    if (design.image_url) {
      try {
        const imageKey = s3Utils.extractKeyFromUrl(design.image_url);
        if (imageKey) {
          await s3Utils.deleteFile(imageKey);
        }
      } catch (error) {
        logger.warn("Failed to delete image from S3", { error: error.message });
      }
    }

    // Delete design record
    await designModel.delete(design_id);

    logger.info("User design deleted successfully", { designId: design_id });
    return response.success({ message: "Design delete success" });
  } catch (error) {
    logger.error("Delete user design error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

module.exports = {
  createUserDesign,
  updateUserDesign,
  getUserDesign,
  getUserDesigns,
  deleteUserDesign,
};
