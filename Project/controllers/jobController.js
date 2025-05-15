const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { uploadJDToGridFS } = require("../models/jobModel");

exports.uploadJobDescription = async (req, res) => {
    console.log(" JD Upload route hit. gfsBucket exists:", !!req.gfsBucket);

    try {
    const gfsBucket = req.gfsBucket;

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    console.log(" Calling uploadJDToGridFS() for JD file:", req.file.originalname);

    // Save JD file to GridFS
    const fileId = await uploadJDToGridFS(gfsBucket, req.file);

    // Extract text from file
    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      extractedText = await pdfParse(req.file.buffer).then((data) => data.text);
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(req.file.buffer) });
      extractedText = result.value;
    } else {
      return res.status(400).send("Unsupported file format");
    }
    console.log("🪣 gfsBucket ready:", !!gfsBucket);
    res.status(200).json({
      message: "Job description uploaded and saved successfully",
      fileId: fileId,
      extractedText: extractedText,
    });
  } catch (err) {
    console.error("Error uploading job description:", err);
    res.status(500).send("Error uploading job description");
  }
};
