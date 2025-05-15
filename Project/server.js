// Load environment variables LUCAS
require("dotenv").config(); //

// Google OAuth 2.0 setup LUCAS
const passport = require("passport"); // authenticatation middleware
const session = require("express-session"); // Session handling
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Google OAth strategy
const path = require("path");

const express = require("express");
const cors = require("cors");
const {
  connectToMongoDB,
  getDb,
  getGfsBucket,
} = require("./db/mongoConnection"); // Import the db module
const resumeRoutes = require("./routers/resumeRoutes");
const jobRoutes = require("./routers/jobRoutes");
const { isAuthenticated } = require("./middlewares/auth");
const { userDb, createUserIndexes } = require("./db/userDB");
const app = express();
const port = 3002;

// Middleware LUCAS
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialise passport and integrate with express session LUCAS
app.use(passport.initialize()); // intialises passport
app.use(passport.session()); // makes sure passport integrates with express-session

// Configure Google OAuth strategy LUCAS
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // From Google Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // From Google Console
      callbackURL: "http://localhost:3002/auth/google/callback", // Correct URL to redirect after Google Login
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile); // Pass user profile to next middleware
    }
  )
);

// Serialise/Deserialise user for session handling LUCAS
passport.serializeUser((user, done) => done(null, user)); // Save user to session
passport.deserializeUser((user, done) => done(null, user)); // Retrieve user from session

// Socket.IO setup
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from your frontend
  },
});

app.use((req, res, next) => {
  req.io = io; // Attach the socket.io instance to the request object
  next();
});

const allowedOrigins = [
  "http://localhost:3000", // Allow localhost
  "http://localhost:3002",
  "http://192.168.4.21:3000", // Allow access from this IP
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
//app.use(express.static(__dirname + "/public"));

// Serve static files like index.html, CSS, and client-side JS from 'public'
app.use(express.static(path.join(__dirname, "public")));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) // Start OAuth flow
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    req.session.userName = req.user.displayName;
    res.redirect("/"); // redirect back to homepage
  }
);

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, name: req.session.userName });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`); // Show welcome message after login
});

app.get("/logout", (req, res) => {
  // Add callback function to req.logout()
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }

    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error destroying session" });
      }

      // Clear the session cookie
      res.clearCookie("connect.sid");

      // Send success response
      res.json({ message: "Logged out successfully" });
    });
  });
});

// MongoDB Connection
connectToMongoDB()
  .then(async () => {
    // Pass the database and GridFSBucket instances to routes
    await createUserIndexes();
    app.use((req, res, next) => {
      req.db = getDb(); // Attach the database instance to the request object
      req.gfsBucket = getGfsBucket(); // Attach the GridFSBucket instance to the request object
      next();
    });

    // Routes
    app.use("/api/resumes", isAuthenticated, resumeRoutes);
    app.use("/api/jobs", isAuthenticated, jobRoutes);

    // Route for the root path (after static middleware)
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    // Start the server
    server.listen(port, () => {
      console.log("Server (HTTP + Socket.IO) listening on port " + port);
    });
  })
  .catch((err) => {
    console.error("Failed to start the server:", err);
  });
