const { ObjectId } = require("mongodb");
const { getDb } = require("./mongoConnection");

// Collection name
const COLLECTION_NAME = "users";

// Create indexes for the users collection
const createUserIndexes = async () => {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);

  await collection.createIndex({ googleId: 1 }, { unique: true });
  await collection.createIndex({ email: 1 }, { unique: true });
  console.log("User indexes created successfully");
};

// User operations
const userDb = {
  // Create a new user
  async createUser(userData) {
    const db = getDb();
    const collection = db.collection(COLLECTION_NAME);

    const user = {
      googleId: userData.id,
      displayName: userData.displayName,
      email: userData.emails[0].value,
      profilePicture: userData.photos[0]?.value,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    const result = await collection.insertOne(user);
    return result;
  },

  // Find user by Google ID
  async findByGoogleId(googleId) {
    const db = getDb();
    const collection = db.collection(COLLECTION_NAME);
    return collection.findOne({ googleId });
  },

  // Update user's last login
  async updateLastLogin(googleId) {
    const db = getDb();
    const collection = db.collection(COLLECTION_NAME);
    return collection.updateOne(
      { googleId },
      { $set: { lastLogin: new Date() } }
    );
  },
};

module.exports = {
  userDb,
  createUserIndexes,
};
