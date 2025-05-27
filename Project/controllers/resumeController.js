const { ObjectId } = require("mongodb");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const {
  getAllResumes,
  getResumeById,
  uploadResumeToGridFS,
  evaluateResume,
} = require("../models/resumeModel");

const { createFeedbackSession } = require("../db/feedbackSessionDB");

// Fetch all uploaded resumes
exports.getAllResumes = async (req, res) => {
  try {
    const db = req.db; // Access the database instance from req
    const files = await getAllResumes(db); // Call the model function
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }
    res.json(files);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).send("Error fetching resumes");
  }
};

// Stream a specific resume
exports.getResumeById = async (req, res) => {
  try {
    const db = req.db; // Access the database instance from req
    const gfsBucket = req.gfsBucket; // Access the GridFSBucket instance from req
    const fileId = req.params.id; // Get the file ID from the request parameters

    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }

    const file = await getResumeById(db, fileId); // Call the model function
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Set the appropriate headers for the file
    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${file.filename}"`,
    });

    // Stream the file content to the response
    const readStream = gfsBucket.openDownloadStream(file._id);
    readStream.pipe(res);

    // Handle stream errors
    readStream.on("error", (err) => {
      console.error("Error streaming file:", err);
      res.status(500).send("Error streaming file");
    });
  } catch (err) {
    console.error("Error fetching resume:", err);
    res.status(500).send("Error fetching resume");
  }
};

// Delete a specific resume
exports.deleteResume = async (req, res) => {
  console.log("deleteResume called");
  console.log("Resume ID:", req.params.id);
  try {
    const gfsBucket = req.gfsBucket;
    const fileId = req.params.id;

    if (!ObjectId.isValid(fileId)) {
      console.warn("Invalid file ID")
      return res.status(400).json({ message: "Invalid file ID" });
    }

    // Delete the file from GridFS
    await gfsBucket.delete(new ObjectId(fileId));
    console.log("Resume Deleted")
    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).json({ message: "Error deleting resume" });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    console.log("Starting uploadResume function");

    const gfsBucket = req.gfsBucket;

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).send("No file uploaded");
    }

    console.log("Uploading file to GridFS");
    const fileId = await uploadResumeToGridFS(gfsBucket, req.file);

    console.log("Extracting text from the uploaded file");
    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      extractedText = await pdfParse(req.file.buffer).then((data) => data.text);
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await mammoth
        .extractRawText({ buffer: Buffer.from(req.file.buffer) })
        .then((result) => result.value);
    } else {
      console.log("Unsupported file format");
      return res.status(400).send("Unsupported file format");
    }

    const sessionData = {
      userId: req.user.id,
      resumeId: fileId,
      feedback: {
        status: "pending",
        //resumeText: extractedText,
        createdAt: new Date(),
      },
    };
    console.log("Creating feedback session with data:", sessionData); // Debug log

    const feedbackSessionId = await createFeedbackSession(sessionData);

    console.log("Sending response back to the frontend");
    res.status(201).send({
      message: "Resume uploaded successfully",
      fileId: fileId,
      extractedText: extractedText,
      feedbackSessionId: feedbackSessionId,
    });
  } catch (err) {
    console.error("Error uploading resume:", err);
    res.status(500).send("Error uploading resume");
  }
};

exports.evaluateResume = async (req, res) => {
  try {
    const { resumeText, jobDescription, feedbackSessionId } = req.body;

    // Validate required fields
    if (!resumeText || !jobDescription || !feedbackSessionId) {
      return res.status(400).json({
        message:
          "Both resume text, job description and feedback session ID are required",
      });
    }

    // Step 1: Perform resume evaluation
    const evaluation = await evaluateResume(
      resumeText,
      jobDescription,
      feedbackSessionId
    );

    // Step 2: Send real-time feedback notification to the specific user
    const io = req.io;
    const userId = req.user?.id;
    const userSockets = req.app.get("userSockets");

    if (io && userId && userSockets instanceof Map) {
      const socketId = userSockets.get(userId);

      if (socketId) {
        io.to(socketId).emit("feedbackReady", {
          message: "Your resume has been evaluated!",
          sessionId: feedbackSessionId,
          evaluation,
        });
        console.log(`Sent feedbackReady to user ${userId} via socket ${socketId}`);
      } else {
        console.warn(`No socket registered for user ${userId}`);
      }
    } else {
      console.warn("Unable to emit feedback notification — io/userId/sockets missing");
    }

    // Step 3: Respond to client
    res.json({ evaluation });

  } catch (err) {
    console.error("Error evaluating resume:", err);
    res.status(500).json({ message: "Error evaluating resume" });
  }
};



exports.uploadJobDescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      extractedText = await pdfParse(req.file.buffer).then((data) => data.text);
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(req.file.buffer),
      });
      extractedText = result.value;
      console.log("🟦 JD extracted text length:", extractedText.length);
      console.log("🟩 JD preview:", extractedText.slice(0, 200)); // First 200 characters
    } else {
      return res.status(400).send("Unsupported file format");
    }

    res.status(200).json({
      message: "Job description uploaded successfully",
      extractedText: extractedText,
    });
  } catch (err) {
    console.error("Error uploading job description:", err);
    res.status(500).send("Error uploading job description");
  }
};