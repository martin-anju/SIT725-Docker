const {
  createFeedbackSession,
  getFeedbackSessionById,
  getFeedbackSessionsByUserId,
  updateFeedbackSession,
  deleteFeedbackSession,
} = require("../db/feedbackSessionDB");

// Create a new feedback session
exports.createSession = async (req, res) => {
  try {
    const sessionData = {
      userId: req.user._id, // Assuming user is authenticated and available in req.user
      resumeId: req.body.resumeId,
      feedback: req.body.feedback,
      jobDescription: req.body.jobDescription,
    };

    const sessionId = await createFeedbackSession(sessionData);
    res.status(201).json({
      message: "Feedback session created successfully",
      sessionId,
    });
  } catch (err) {
    console.error("Error creating feedback session:", err);
    res.status(500).json({ message: "Error creating feedback session" });
  }
};

// Get a specific feedback session
exports.getSession = async (req, res) => {
  try {
    const session = await getFeedbackSessionById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: "Feedback session not found" });
    }
    res.json(session);
  } catch (err) {
    console.error("Error fetching feedback session:", err);
    res.status(500).json({ message: "Error fetching feedback session" });
  }
};

// Get all feedback sessions for the current user
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the authenticated session
    console.log("Fetching sessions for user:", userId);

    const sessions = await getFeedbackSessionsByUserId(userId);
    res.json(sessions);
  } catch (err) {
    console.error("Error fetching user feedback sessions:", err);
    res.status(500).json({ message: "Error fetching user feedback sessions" });
  }
};

// Update a feedback session
exports.updateSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const updateData = req.body;

    await updateFeedbackSession(sessionId, updateData);
    res.json({ message: "Feedback session updated successfully" });
  } catch (err) {
    console.error("Error updating feedback session:", err);
    res.status(500).json({ message: "Error updating feedback session" });
  }
};

// Delete a feedback session
exports.deleteSession = async (req, res) => {
  try {
    await deleteFeedbackSession(req.params.sessionId);
    res.json({ message: "Feedback session deleted successfully" });
  } catch (err) {
    console.error("Error deleting feedback session:", err);
    res.status(500).json({ message: "Error deleting feedback session" });
  }
};
