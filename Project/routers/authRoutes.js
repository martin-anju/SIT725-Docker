const express = require("express");
const passport = require("passport");
const { handleGoogleCallback, checkUserSession, logoutUser } = require("../controllers/authController");

const router = express.Router();

// Google OAuth Login Route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback Route
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), handleGoogleCallback);

// Logout Route
router.get("/logout", logoutUser);

// User Session Check Route
router.get("/user", checkUserSession);

module.exports = router;