const express = require("express");
const router = express.Router();
const feedbackSessionController = require("../controllers/feedbackSessionController");
const { isAuthenticated } = require("../middlewares/auth"); // Assuming you have auth middleware

// All routes require authentication
router.use(isAuthenticated);

// Create a new feedback session
router.post("/", feedbackSessionController.createSession);

// Get a specific feedback session
router.get("/:sessionId", feedbackSessionController.getSession);

// Get all feedback sessions for the current user
router.get("/user/sessions", feedbackSessionController.getUserSessions);

// Update a feedback session
router.put("/:sessionId", feedbackSessionController.updateSession);

// Delete a feedback session
router.delete("/:sessionId", feedbackSessionController.deleteSession);

module.exports = router;
