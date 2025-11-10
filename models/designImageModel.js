const { v4: uuidv4 } = require("uuid");
const { dbUtils, TABLES, logger } = require("../utils/aws.js");

class DesignImageModel {
  constructor() {
    this.tableName = TABLES.DESIGN_IMAGES;
  }

  async create(imageData) {
    try {
      const designImage = {
        id: uuidv4(),
        image_url: imageData.image_url,
        category: imageData.category || "general",
        tags: imageData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbUtils.put(this.tableName, designImage);
      logger.info("Design image created successfully", {
        imageId: designImage.id,
      });
      return designImage;
    } catch (error) {
      logger.error("Error creating design image", {
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
      logger.error("Error finding design image by ID", {
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
      logger.error("Error finding all design images", { error: error.message });
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
      logger.error("Error finding design images by category", {
        error: error.message,
        category,
      });
      throw error;
    }
  }

  async delete(id) {
    try {
      await dbUtils.delete(this.tableName, { id });
      logger.info("Design image deleted successfully", { imageId: id });
      return true;
    } catch (error) {
      logger.error("Error deleting design image", { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new DesignImageModel();
