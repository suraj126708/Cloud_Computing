const { v4: uuidv4 } = require("uuid");
const { dbUtils, TABLES, logger } = require("../utils/aws.js");

class UserModel {
  constructor() {
    this.tableName = TABLES.USERS;
  }

  async create(userData) {
    try {
      const user = {
        id: uuidv4(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        image: userData.image || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dbUtils.put(this.tableName, user);
      logger.info("User created successfully", {
        userId: user.id,
        email: user.email,
      });
      return user;
    } catch (error) {
      logger.error("Error creating user", { error: error.message, userData });
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await dbUtils.get(this.tableName, { id });
      return result.Item || null;
    } catch (error) {
      logger.error("Error finding user by ID", { error: error.message, id });
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const result = await dbUtils.query(
        this.tableName,
        "email = :email",
        { ":email": email },
        "EmailIndex"
      );
      return result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      logger.error("Error finding user by email", {
        error: error.message,
        email,
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

      logger.info("User updated successfully", { userId: id });
      return result.Attributes;
    } catch (error) {
      logger.error("Error updating user", {
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
      logger.info("User deleted successfully", { userId: id });
      return true;
    } catch (error) {
      logger.error("Error deleting user", { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new UserModel();
