require("dotenv").config(); //


// Google OAuth 2.0 setup LUCAS
const { setupGoogleStrategy } = require("./controllers/authController");
const passport = require("passport"); // authenticatation middleware
const session = require("express-session"); // Session handling
const path = require("path");
const mongoose = require("mongoose");

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
const { isAuthenticated } = require("./middlewares/auth");
const { userDb, createUserIndexes } = require("./db/userDB");
const app = express();
const port = 3002;
const feedbackSessionRoutes = require("./routers/feebackSessionRoutes");

// Session Config
app.use(
  session({
    name: "userSessionToken",
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
  })
);

// Initialise passport and integrate with express session LUCAS
app.use(passport.initialize()); // intialises passport
app.use(passport.session()); // makes sure passport integrates with express-session

// Socket.IO setup
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from your frontend
  },
});

// Track user sockets for per-user notifications
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("registerUser", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`✅ Registered user ${userId} to socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, id] of userSockets.entries()) {
      if (id === socket.id) {
        userSockets.delete(userId);
        console.log(` Removed socket mapping for user ${userId}`);
        break;
      }
    }
    console.log(" Client disconnected:", socket.id);
  });
});

// Make userSockets available in all routes/controllers
app.set("userSockets", userSockets);

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

// Serve static files like index.html, CSS, and client-side JS from 'public'
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);

app.get('/api/student', (req, res) => {
  res.json({
    name: "Anju Martin Palakeel",
    studentId: "s223563396"
  });
});


app.get("/profile", (req, res) => {
  res.send(`Welcome ${req.user.displayName}`); // Show welcome message after login
});

connectToMongoDB()
  .then(async () => {
    // Connect Mongoose
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    // Ensure user indexes are created
    await createUserIndexes();

    // Set up Google OAuth AFTER DB and Mongoose are connected
    setupGoogleStrategy();

    app.use((req, res, next) => {
      req.db = getDb(); // Attach the database instance to the request object
      req.gfsBucket = getGfsBucket(); // Attach the GridFSBucket instance to the request object
      next();
    });

    // Routes
    app.use("/api/resumes", isAuthenticated, resumeRoutes);
    app.use("/api/jobs", isAuthenticated, jobRoutes);
    app.use("/api/feedback-sessions", isAuthenticated, feedbackSessionRoutes);

    // Route for the root path (after static middleware)
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    // Add this route to respond to /api/user
    app.get("/api/user", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      name: req.user.displayName,
      id: req.user.id, 
    });
  } else {
    res.json({ loggedIn: false });
  }
});

    // Start the server
    server.listen(port, () => {
      console.log("Server (HTTP + Socket.IO) listening on port " + port);
    });
  })
  .catch((err) => {
    console.error("Failed to start the server:", err);
  });
