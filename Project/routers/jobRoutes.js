const express = require("express");
const multer = require("multer");
const jobController = require("../controllers/jobController");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("jobFile"), jobController.uploadJobDescription);

module.exports = router;
