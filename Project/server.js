// Load environment variables LUCAS
require("dotenv").config();

// Google OAuth 2.0 setup LUCAS
const { setupGoogleStrategy } = require("./controllers/authController");
const passport = require("passport"); // authenticatation middleware
const session = require("express-session"); // Session handling
const path = require("path");

const express = require("express");
const cors = require("cors");
const {
  connectToMongoDB,
  getDb,
  getGfsBucket,
} = require("./db/mongoConnection"); // Import the db module
const resumeRoutes = require("./routers/resumeRoutes");
const authRoutes = require("./routers/authRoutes");
const jobRoutes = require("./routers/jobRoutes");

const app = express();
const port = 3002;

// Middleware LUCAS
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
})
);

// Initialise passport and integrate with express session LUCAS
app.use(passport.initialize()); // intialises passport
app.use(passport.session()); // makes sure passport integrates with express-session

setupGoogleStrategy(); // Apply the Google OAuth strategy and session setup

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

app.use("/auth", authRoutes);

app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`); // Show welcome message after login
});

// MongoDB Connection
connectToMongoDB()
  .then(() => {
    // Pass the database and GridFSBucket instances to routes
    app.use((req, res, next) => {
      req.db = getDb(); // Attach the database instance to the request object
      req.gfsBucket = getGfsBucket(); // Attach the GridFSBucket instance to the request object
      next();
    });

    // Routes
    app.use("/api/resumes", resumeRoutes);
    app.use("/api/jobs", jobRoutes);
    
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
