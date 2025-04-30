const express = require("express");
const multer = require("multer");
const resumeController = require("../controllers/resumeController");

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get("/", resumeController.getAllResumes); // Fetch all resumes
router.get("/:id", resumeController.getResumeById); // Stream a specific resume
router.post("/upload", upload.single("resume"), resumeController.uploadResume); // Upload a new resume
router.post("/evaluate", resumeController.evaluateResume);

module.exports = router;
