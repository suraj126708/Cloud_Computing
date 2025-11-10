import fs from "fs";
import sharp from "sharp";

(async () => {
  try {
    await sharp("project.png").resize(300).toFile("output.jpg");

    console.log("✅ Sharp is working locally.");
  } catch (err) {
    console.error("❌ Sharp error:", err);
  }
})();
