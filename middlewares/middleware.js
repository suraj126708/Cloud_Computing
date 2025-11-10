const jwt = require("jsonwebtoken");
const { logger } = require("../utils/aws.js");

const auth = async (event) => {
  try {
    const headers = event.headers || {};
    // Handle different possible casings of the Authorization header
    const rawAuthHeader =
      headers.authorization || headers.Authorization || headers.AUTHORIZATION;

    if (!rawAuthHeader) {
      logger.warn("No authorization header provided");
      return { error: "No authorization header provided" };
    }

    // Extract token in a case-insensitive way for the Bearer scheme
    const token = rawAuthHeader.replace(/^Bearer\s+/i, "");

    if (!token || token === rawAuthHeader) {
      logger.warn("No token provided in authorization header");
      return { error: "No token provided" };
    }

    try {
      const userInfo = await jwt.verify(
        token,
        process.env.JWT_SECRET || "farid"
      );
      logger.info("User authenticated successfully", {
        userId: userInfo._id,
        email: userInfo.email,
      });
      return { userInfo };
    } catch (error) {
      logger.warn("Invalid token provided", { error: error.message });
      return { error: "Invalid token" };
    }
  } catch (error) {
    logger.error("Authentication error", { error: error.message });
    return { error: "Authentication failed" };
  }
};

module.exports = auth;
