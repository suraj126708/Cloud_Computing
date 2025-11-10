const { v4: uuidv4 } = require("uuid");
const { dbUtils, TABLES, logger } = require("../utils/aws.js");

class TemplateModel {
  constructor() {
    this.tableName = TABLES.TEMPLATES;
  }

  async create(templateData) {
    try {
      const template = {
        id: uuidv4(),
        components: templateData.components || [],
        image_url: templateData.image_url || "",
        name: templateData.name || "Untitled Template",
        category: templateData.category || "general",
        tags: templateData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbUtils.put(this.tableName, template);
      logger.info("Template created successfully", { templateId: template.id });
      return template;
    } catch (error) {
      logger.error("Error creating template", {
        error: error.message,
        templateData,
      });
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await dbUtils.get(this.tableName, { id });
      return result.Item || null;
    } catch (error) {
      logger.error("Error finding template by ID", {
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
      logger.error("Error finding all templates", { error: error.message });
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
      logger.error("Error finding templates by category", {
        error: error.message,
        category,
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
        if (key !== "id" && key !== "createdAt") {
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

      logger.info("Template updated successfully", { templateId: id });
      return result.Attributes;
    } catch (error) {
      logger.error("Error updating template", {
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
      logger.info("Template deleted successfully", { templateId: id });
      return true;
    } catch (error) {
      logger.error("Error deleting template", { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new TemplateModel();
