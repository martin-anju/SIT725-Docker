const { getDb } = require("../db/mongoConnection");

// Find a user in the "users" collection by their Google ID
async function findUserByGoogleId(googleId) {
  const db = getDb();
  return await db.collection("users").findOne({ googleId });
}

// Create a new user in the "users" collection
async function createUser(user) {
  const db = getDb();
  await db.collection("users").insertOne({
    ...user,
    createdAt: new Date(),
  });
}

module.exports = {
  findUserByGoogleId,
  createUser,
};