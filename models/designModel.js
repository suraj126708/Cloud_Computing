const { v4: uuidv4 } = require("uuid");
const { dbUtils, TABLES, logger } = require("../utils/aws.js");

class DesignModel {
  constructor() {
    this.tableName = TABLES.DESIGNS;
  }

  async create(designData) {
    try {
      const design = {
        id: uuidv4(),
        user_id: designData.user_id,
        components: designData.components || [],
        image_url: designData.image_url || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbUtils.put(this.tableName, design);
      logger.info("Design created successfully", {
        designId: design.id,
        userId: design.user_id,
      });
      return design;
    } catch (error) {
      logger.error("Error creating design", {
        error: error.message,
        designData,
      });
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await dbUtils.get(this.tableName, { id });
      return result.Item || null;
    } catch (error) {
      logger.error("Error finding design by ID", { error: error.message, id });
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
      logger.error("Error finding designs by user ID", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      let updateExpression = "SET updatedAt = :updatedAt";
      const expressionAttributeValues = {
        ":updatedAt": new Date().toISOString(),
      };
      const expressionAttributeNames = {};

      // Dynamically build update expression
      Object.keys(updateData).forEach((key) => {
        if (key !== "id" && key !== "createdAt" && key !== "user_id") {
          expressionAttributeNames[`#${key}`] = key;
          updateExpression += `, #${key} = :${key}`;
          expressionAttributeValues[`:${key}`] = updateData[key];
        }
      });

      const result = await dbUtils.update(
        this.tableName,
        { id },
        updateExpression,
        expressionAttributeValues,
        expressionAttributeNames
      );

      logger.info("Design updated successfully", { designId: id });
      return result.Attributes;
    } catch (error) {
      logger.error("Error updating design", {
        error: error.message,
        id,
        updateData,
      });
      throw error;
    }
  }

  async delete(id) {
    try {
      await dbUtils.delete(this.tableName, { id });
      logger.info("Design deleted successfully", { designId: id });
      return true;
    } catch (error) {
      logger.error("Error deleting design", { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new DesignModel();
