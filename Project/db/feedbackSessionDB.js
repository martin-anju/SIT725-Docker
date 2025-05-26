const { ObjectId } = require("mongodb");
const { getDb } = require("./mongoConnection");

const COLLECTION_NAME = "feedbackSessions";

const createFeedbackSession = async (sessionData) => {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);

  // Create a new feedback session document
  const feedbackSession = {
    userId: sessionData.userId,
    resumeId: sessionData.resumeId,
    feedback: sessionData.feedback,
    jobDescription: sessionData.jobDescription,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Insert the document into the collection
  const result = await collection.insertOne(feedbackSession);
  return result.insertedId;
};

const getFeedbackSessionById = async (sessionId) => {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);
  return await collection.findOne({ _id: new ObjectId(sessionId) });
};

const updateFeedbackSession = async (sessionId, updateData) => {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);
  console.log("Updating feedback session with data:", updateData);

  const result = await collection.updateOne(
    { _id: new ObjectId(sessionId) },
    {
      $set: {
        feedback: {
          status: "completed",
          scores: updateData.scores,
          explanation: updateData.explanation,
          updatedAt: new Date(),
        },
        jobDescription: updateData.jobDescription,
      },
    }
  );
  return result;
};

const deleteFeedbackSession = async (sessionId) => {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);
};

const getFeedbackSessionsByUserId = async (userId) => {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);

  return await collection
    .find({
      userId: userId,
    })
    .sort({ createdAt: -1 })
    .toArray(); // Sort by newest first
};

module.exports = {
  createFeedbackSession,
  getFeedbackSessionById,
  updateFeedbackSession,
  deleteFeedbackSession,
  getFeedbackSessionsByUserId,
};
