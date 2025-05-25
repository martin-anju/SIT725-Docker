const { ObjectId } = require("mongodb");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const { updateFeedbackSession } = require("../db/feedbackSessionDB");

dotenv.config(); // Load environment variables from .env file
const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

// Fetch all uploaded resumes
const getAllResumes = async (db) => {
  console.log("Fetching all resumes from the database...");
  return await db.collection("uploads.files").find().toArray();
};

// Find a specific resume by ID
const getResumeById = async (db, fileId) => {
  return await db
    .collection("uploads.files")
    .findOne({ _id: new ObjectId(fileId) });
};

// Upload a new resume to GridFS
const uploadResumeToGridFS = (gfsBucket, file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gfsBucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });

    uploadStream.end(file.buffer);

    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", (err) => reject(err));
  });
};

// Evaluate the resume using Google GenAI
const evaluateResume = async (
  resumeText,
  jobDescription,
  feedbackSessionId
) => {
  try {
    const prompt = `
      You are an AI assistant helping to evaluate resumes.

      Please analyze the following resume text and compare it with the provided job description.
      
      Provide scores (out of 100) for the following categories:
      1. Technical Skills
      2. Leadership Qualities
      3. Relevance to the job description

      Additionally, provide feedback on whether the resume needs to be tailored to better match the job description.
      Return your results in JSON format with the keys: "Technical Skills", "Leadership", "Tailor", and "Relevance".

      Also, provide a detailed explanation for each score and tailoring recommendation in a separate section labeled "Explanation". 

      Example response format:
      {
        "Technical Skills": <score>,
        "Leadership": <score>,
        "Relevance": <score>,
        "Tailor": "<Yes/No>"
      }

      Detailed explanation format:
      {
        "Explanation": {
          "Technical Skills": "<Explanation for the score>",
          "Leadership": "<Explanation for the score>",
          "Relevance": "<Explanation for the score>",
          "Tailor": "<Explanation for tailoring recommendation>"
        }
      }

      Resume Text: 
      ${resumeText}

      Job Description: 
      ${jobDescription}
    `;

    // Request content generation using Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Log raw response for debugging
    console.log("Raw response from Gemini:", response.text);
    console.log("🟦 Feedback Session ID:", feedbackSessionId);

    // Extract the first valid JSON object from the response
    const jsonMatch = response.text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response.");
    }

    const cleanedResponse = jsonMatch[0]; // Extract the JSON part
    console.log("Extracted JSON:", cleanedResponse); // Log the cleaned JSON for debugging

    // Parse the JSON response
    const parsedResponse = JSON.parse(cleanedResponse);

    // Improved regex for better Explanation extraction
    const explanationMatch = response.text.match(
      /"Explanation":\s*\{([\s\S]*?)\}/
    );
    const explanationText = explanationMatch
      ? explanationMatch[1]
      : "No explanation provided.";

    // Define scores based on parsed response
    const scores = {
      "Technical Skills": parsedResponse["Technical Skills"] || 0,
      Leadership: parsedResponse["Leadership"] || 0,
      Relevance: parsedResponse["Relevance"] || 0,
      Tailor: parsedResponse["Tailor"] || "No", // Default to "No" if not present
    };
    const importantKeywords = [
      "python",
      "sql",
      "aws",
      "azure",
      "gcp",
      "pytorch",
      "tensorflow",
      "dbt",
      "power bi",
      "tableau",
      "cloud",
      "ml",
      "machine learning",
      "data analysis",
    ];

    const normalize = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s+]/g, " ") // remove punctuation
        .replace(/\s+/g, " ") // collapse extra whitespace
        .trim();

    const jdNormalized = normalize(jobDescription);
    const resumeNormalized = normalize(resumeText);

    const missingKeywords = importantKeywords.filter(
      (keyword) =>
        jdNormalized.includes(keyword) && !resumeNormalized.includes(keyword)
    );
    console.log("Missing keywords:", missingKeywords);

    // Update feedback session with complete evaluation data
    if (feedbackSessionId) {
      await updateFeedbackSession(feedbackSessionId, {
        status: "completed",
        scores: scores,
        explanation: explanationText,
        jobDescription: jobDescription,
        updatedAt: new Date(),
      });
    }

    // Return structured result with explanation and scores
    return {
      evaluation: "Resume evaluation completed successfully.",
      scores: scores,
      explanation: explanationText,
      missingKeywords: missingKeywords,
    };
  } catch (err) {
    // Log and rethrow the error for debugging
    console.error("Error evaluating resume:", err);
    throw new Error(
      "Error evaluating the resume. Please check the logs for details."
    );
  }
};

module.exports = {
  getAllResumes,
  getResumeById,
  uploadResumeToGridFS,
  evaluateResume,
};
