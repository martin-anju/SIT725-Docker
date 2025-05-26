// jobModel.js
const { ObjectId } = require("mongodb");

// Upload JD file to GridFS with metadata
const uploadJDToGridFS = (gfsBucket, file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gfsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { 
        fileType: "jobDescription",
        deleted: false
       }, 
    });
    console.log("📦 Calling uploadStream.end() to write file buffer...");
    uploadStream.end(file.buffer);
    

    uploadStream.on("finish", () => {
        console.log("✅ JD file saved to GridFS with ID:", uploadStream.id);
        resolve(uploadStream.id);
      });
    uploadStream.on("error", (err) => reject(err));
  });
};

// Fetch all uploaded job descriptions from GridFS
const getAllJobDescriptions = async (db) => {
  return await db
    .collection("uploads.files")
    .find({ "metadata.fileType": "jobDescription", "metadata.deleted": { $ne: true } })
    .toArray();
};

// Fetch a specific job description by ID
const getJobDescriptionById = async (db, fileId) => {
  return await db
    .collection("uploads.files")
    .findOne({ _id: new ObjectId(fileId), "metadata.fileType": "jobDescription" });
};

module.exports = {
  uploadJDToGridFS,
  getAllJobDescriptions,
  getJobDescriptionById,
};
