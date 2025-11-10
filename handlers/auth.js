const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { response, logger } = require("../utils/aws");

const register = async (event) => {
  try {
    logger.info("User registration attempt", { body: event.body });

    const { name, email, password } = JSON.parse(event.body || "{}");

    if (!name || !email || !password) {
      return response.error("Name, email, and password are required", 400);
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    // Check if user already exists
    const existingUser = await userModel.findByEmail(trimmedEmail);
    if (existingUser) {
      logger.warn("Registration attempt with existing email", {
        email: trimmedEmail,
      });
      return response.error("Email already exists", 409);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(trimmedPassword, 9);
    const user = await userModel.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        _id: user.id,
      },
      process.env.JWT_SECRET || "farid",
      { expiresIn: "2d" }
    );

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
    });
    return response.success({ message: "Signup success", token }, 201);
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const login = async (event) => {
  try {
    logger.info("User login attempt", { body: event.body });

    const { email, password } = JSON.parse(event.body || "{}");

    if (!email || !password) {
      return response.error("Email and password are required", 400);
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Find user by email
    const user = await userModel.findByEmail(trimmedEmail);
    if (!user) {
      logger.warn("Login attempt with non-existent email", {
        email: trimmedEmail,
      });
      return response.error("Email doesn't exist", 404);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!passwordMatch) {
      logger.warn("Login attempt with invalid password", {
        email: trimmedEmail,
      });
      return response.error("Password invalid", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        _id: user.id,
      },
      process.env.JWT_SECRET || "farid",
      { expiresIn: "2d" }
    );

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
    });
    return response.success({ message: "Signin success", token });
  } catch (error) {
    logger.error("Login error", { error: error.message });
    return response.error("Internal server error", 500, error);
  }
};

const ping = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "This is a dummy route working fine!",
    }),
  };
};

module.exports = {
  register,
  login,
  ping,
};
