const { v4: uuidv4 } = require("uuid");
const { dbUtils, TABLES, logger } = require("../utils/aws.js");

class BackgroundImageModel {
  constructor() {
    this.tableName = TABLES.BACKGROUND_IMAGES;
  }

  async create(imageData) {
    try {
      const backgroundImage = {
        id: uuidv4(),
        image_url: imageData.image_url,
        category: imageData.category || "general",
        tags: imageData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbUtils.put(this.tableName, backgroundImage);
      logger.info("Background image created successfully", {
        imageId: backgroundImage.id,
      });
      return backgroundImage;
    } catch (error) {
      logger.error("Error creating background image", {
        error: error.message,
        imageData,
      });
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await dbUtils.get(this.tableName, { id });
      return result.Item || null;
    } catch (error) {
      logger.error("Error finding background image by ID", {
        error: error.message,
        id,
      });
      throw error;
    }
  }

  async findAll() {
    try {
      const result = await dbUtils.scan(this.tableName);
      return result.Items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      logger.error("Error finding all background images", {
        error: error.message,
      });
      throw error;
    }
  }

  async findByCategory(category) {
    try {
      const result = await dbUtils.scan(
        this.tableName,
        "category = :category",
        { ":category": category }
      );
      return result.Items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      logger.error("Error finding background images by category", {
        error: error.message,
        category,
      });
      throw error;
    }
  }

  async delete(id) {
    try {
      await dbUtils.delete(this.tableName, { id });
      logger.info("Background image deleted successfully", { imageId: id });
      return true;
    } catch (error) {
      logger.error("Error deleting background image", {
        error: error.message,
        id,
      });
      throw error;
    }
  }
}

module.exports = new BackgroundImageModel();
