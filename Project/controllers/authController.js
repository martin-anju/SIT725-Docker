const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { findUserByGoogleId, createUser } = require("../models/userModel");

function setupGoogleStrategy() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3002/auth/google/callback",
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await findUserByGoogleId(profile.id);
                if (existingUser) {
                    return done(null, existingUser);
                }
                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    createdAt: new Date(),
                };

                await createUser(newUser);
                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
    );

    passport.serializeUser((user, done) => {
        done(null, user.googleId);
    });

    passport.deserializeUser(async (googleId, done) => {
        try {
            const user = await findUserByGoogleId(googleId);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}

// Handles the successful Google OAuth login callback
function handleGoogleCallback(req, res) {
    req.session.userName = req.user.name || req.user.displayName;
    res.redirect("/");
}

// Checks if a user is currently authenticated
function checkUserSession(req, res) {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, name: req.session.userName });
    } else {
        res.json({ loggedIn: false });
    }
}

// Logs the user out and redirects to home
function logoutUser(req, res, next) {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/");
    });
}

module.exports = { setupGoogleStrategy, handleGoogleCallback, checkUserSession, logoutUser };