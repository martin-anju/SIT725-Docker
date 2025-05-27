const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

// Utility functions using the Mongoose model
async function findUserByGoogleId(googleId) {
  return await User.findOne({ googleId });
}

async function createUser(userData) {
  const newUser = new User(userData);
  return await newUser.save();
}

module.exports = {
  User,
  findUserByGoogleId,
  createUser,
};

