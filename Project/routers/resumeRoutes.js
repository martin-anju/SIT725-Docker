const express = require("express");
const multer = require("multer");
const resumeController = require("../controllers/resumeController");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get("/", isAuthenticated, resumeController.getAllResumes); // Fetch all resumes
router.get("/:id", isAuthenticated, resumeController.getResumeById); // Stream a specific resume
router.post(
  "/upload",
  isAuthenticated,
  upload.single("resume"),
  resumeController.uploadResume
); // Upload a new resume
router.post("/evaluate", isAuthenticated, resumeController.evaluateResume);
router.post(
  "/upload-jd",
  isAuthenticated,
  upload.single("jobFile"),
  resumeController.uploadJobDescription
);

module.exports = router;
