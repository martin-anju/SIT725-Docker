const { userDb } = require("../db/userDB");

const createUser = async (req, res) => {
  try {
    const result = await userDb.createUser(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const findByGoogleId = async (req, res) => {
  try {
    const googleId = req.params.googleId;
    const result = await userDb.findByGoogleId(googleId);
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ error: "Failed to find user" });
  }
};

// Add new method to handle user session
const getCurrentUser = async (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      user: {
        displayName: req.user.displayName,
        email: req.user.emails[0].value,
        profilePicture: req.user.photos[0]?.value,
      },
    });
  } else {
    res.json({ loggedIn: false });
  }
};

module.exports = {
  createUser,
  findByGoogleId,
  getCurrentUser,
};
