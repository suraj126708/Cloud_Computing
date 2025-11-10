const { v4: uuidv4 } = require("uuid");
const { dbUtils, TABLES, logger } = require("../utils/aws.js");

class UserImageModel {
  constructor() {
    this.tableName = TABLES.USER_IMAGES;
  }

  async create(imageData) {
    try {
      const userImage = {
        id: uuidv4(),
        user_id: imageData.user_id,
        image_url: imageData.image_url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbUtils.put(this.tableName, userImage);
      logger.info("User image created successfully", {
        imageId: userImage.id,
        userId: userImage.user_id,
      });
      return userImage;
    } catch (error) {
      logger.error("Error creating user image", {
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
      logger.error("Error finding user image by ID", {
        error: error.message,
        id,
      });
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      const result = await dbUtils.query(
        this.tableName,
        "user_id = :user_id",
        { ":user_id": userId },
        "UserIdIndex"
      );

      // Sort by createdAt descending
      return result.Items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      logger.error("Error finding user images by user ID", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  async delete(id) {
    try {
      await dbUtils.delete(this.tableName, { id });
      logger.info("User image deleted successfully", { imageId: id });
      return true;
    } catch (error) {
      logger.error("Error deleting user image", { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new UserImageModel();
