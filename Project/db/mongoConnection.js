const { MongoClient, GridFSBucket } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const mongoURI = process.env.MONGODB_URI; // Replace with your MongoDB URI
let db; // Database instance
let gfsBucket; // GridFSBucket instance

const connectToMongoDB = async () => {
  try {
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(); // Get the database instance
    gfsBucket = new GridFSBucket(db, { bucketName: "uploads" }); // Initialize GridFSBucket
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err; // Re-throw the error to handle it in the server
  }
};

// Export the database and GridFSBucket instances
const getDb = () => db;
const getGfsBucket = () => gfsBucket;

module.exports = { connectToMongoDB, getDb, getGfsBucket };
