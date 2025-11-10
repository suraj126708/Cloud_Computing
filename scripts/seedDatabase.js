const { v4: uuidv4 } = require("uuid");
const designImageModel = require("../models/designImageModel");
const backgroundImageModel = require("../models/backgroundImageModel");
const templateModel = require("../models/templateModel");
const { logger } = require("../utils/aws");

// Sample data for initial setup
const sampleDesignImages = [
  {
    image_url: "https://picsum.photos/seed/design1/300/200",
    category: "business",
    tags: ["professional", "corporate"],
  },
  {
    image_url: "https://picsum.photos/seed/design2/300/200",
    category: "creative",
    tags: ["artistic", "colorful"],
  },
  {
    image_url: "https://picsum.photos/seed/design3/300/200",
    category: "education",
    tags: ["learning", "academic"],
  },
];

const sampleBackgroundImages = [
  {
    image_url: "https://picsum.photos/seed/bg1/800/600",
    category: "nature",
    tags: ["outdoor", "landscape"],
  },
  {
    image_url: "https://picsum.photos/seed/bg2/800/600",
    category: "abstract",
    tags: ["modern", "geometric"],
  },
  {
    image_url: "https://picsum.photos/seed/bg3/800/600",
    category: "gradient",
    tags: ["colorful", "smooth"],
  },
];

const sampleTemplates = [
  {
    name: "Business Card Template",
    components: [
      {
        type: "text",
        content: "Your Name",
        position: { x: 50, y: 100 },
        style: { fontSize: 24, color: "#000000", fontWeight: "bold" },
      },
      {
        type: "text",
        content: "Your Title",
        position: { x: 50, y: 130 },
        style: { fontSize: 16, color: "#666666" },
      },
    ],
    image_url: "https://picsum.photos/seed/template1/400/250",
    category: "business",
    tags: ["professional", "contact"],
  },
  {
    name: "Social Media Post",
    components: [
      {
        type: "text",
        content: "Amazing Content Here!",
        position: { x: 100, y: 150 },
        style: { fontSize: 28, color: "#FFFFFF", fontWeight: "bold" },
      },
    ],
    image_url: "https://picsum.photos/seed/template2/400/400",
    category: "social",
    tags: ["social media", "marketing"],
  },
];

async function seedDatabase() {
  try {
    logger.info("Starting database seeding...");

    // Seed design images
    logger.info("Seeding design images...");
    for (const imageData of sampleDesignImages) {
      await designImageModel.create(imageData);
    }

    // Seed background images
    logger.info("Seeding background images...");
    for (const imageData of sampleBackgroundImages) {
      await backgroundImageModel.create(imageData);
    }

    // Seed templates
    logger.info("Seeding templates...");
    for (const templateData of sampleTemplates) {
      await templateModel.create(templateData);
    }

    logger.info("Database seeding completed successfully!");
    console.log("✅ Database seeded with sample data");
    console.log("📊 Design Images:", sampleDesignImages.length);
    console.log("🖼️ Background Images:", sampleBackgroundImages.length);
    console.log("📋 Templates:", sampleTemplates.length);
  } catch (error) {
    logger.error("Database seeding failed", { error: error.message });
    console.error("❌ Database seeding failed:", error.message);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  sampleDesignImages,
  sampleBackgroundImages,
  sampleTemplates,
};
