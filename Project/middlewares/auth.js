const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log("🔒 Authentication check:", {
    isAuthenticated: req.isAuthenticated(),
    session: req.session ? "Session exists" : "No session",
    user: req.user ? req.user.displayName : "No user",
  });

  if (req.isAuthenticated()) {
    console.log("✅ User authenticated successfully");
    return next();
  }

  console.log("❌ Authentication failed - User not logged in");
  res.status(401).json({ message: "Unauthorized - Please log in" });
};

module.exports = {
  isAuthenticated,
};
