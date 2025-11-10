const templateModel = require("../models/templateModel.js");
const designModel = require("../models/designModel.js");
const { response, logger, s3Utils } = require("../utils/aws.js");
const auth = require("../middlewares/middleware.js");

const getTemplates = async (event) => {
  try {
    logger.info("Get templates attempt", { headers: event.headers });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const templates = await templateModel.findAll();

    logger.info("Templates retrieved successfully", {
      count: templates.length,
    });
    return response.success({ templates });
  } catch (error) {
    logger.error("Get templates error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const addUserTemplate = async (event) => {
  try {
    logger.info("Add user template attempt", {
      pathParameters: event.pathParameters,
    });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { _id } = authResult.userInfo;
    const { template_id } = event.pathParameters || {};

    if (!template_id) {
      return response.error("Template ID is required", 400);
    }

    // Get template
    const template = await templateModel.findById(template_id);
    if (!template) {
      return response.error("Template not found", 404);
    }

    // Create design from template
    const design = await designModel.create({
      user_id: _id,
      components: template.components,
      image_url: template.image_url,
    });

    logger.info("User template added successfully", {
      designId: design.id,
      templateId: template_id,
      userId: _id,
    });
    return response.success({ design });
  } catch (error) {
    logger.error("Add user template error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const deleteTemplate = async (event) => {
  try {
    logger.info("Delete template attempt", {
      pathParameters: event.pathParameters,
    });

    // Authenticate user
    const authResult = await auth(event);
    if (authResult.error) {
      return response.error(authResult.error, 401);
    }

    const { template_id } = event.pathParameters || {};
    if (!template_id) {
      return response.error("Template ID is required", 400);
    }

    // Get template to check if it exists and get image URL
    const template = await templateModel.findById(template_id);
    if (!template) {
      return response.error("Template not found", 404);
    }

    // Delete image from S3 if exists
    if (template.image_url) {
      try {
        const imageKey = s3Utils.extractKeyFromUrl(template.image_url);
        if (imageKey) {
          await s3Utils.deleteFile(imageKey);
        }
      } catch (error) {
        logger.warn("Failed to delete template image from S3", {
          error: error.message,
        });
      }
    }

    // Delete template record
    await templateModel.delete(template_id);

    logger.info("Template deleted successfully", { templateId: template_id });
    return response.success({ message: "Template deleted successfully" });
  } catch (error) {
    logger.error("Delete template error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

module.exports = {
  getTemplates,
  addUserTemplate,
  deleteTemplate,
};
