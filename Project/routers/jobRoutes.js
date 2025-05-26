const express = require("express");
const multer = require("multer");
const jobController = require("../controllers/jobController");
const { getAllJobDescriptions } = require("../models/jobModel");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload JD file
router.post("/upload", isAuthenticated, upload.single("jobFile"), jobController.uploadJobDescription);
router.delete("/:id", isAuthenticated, jobController.softDeleteJob);

// ✅ New route: Fetch JD history
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const db = req.db;
    const files = await getAllJobDescriptions(db);
    res.json(files);
  } catch (err) {
    console.error("Error fetching JD history:", err);
    res.status(500).json({ message: "Failed to fetch JD history" });
  }
});

module.exports = router;
