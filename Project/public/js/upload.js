export function handleFileUpload() {
  const form = document.getElementById("resumeForm");
  const fileInput = document.getElementById("resumeFile");
  const uploadStatus = document.getElementById("uploadStatus");
  const extractedTextArea = document.getElementById("extractedText");
  const getFeedbackBtn = document.getElementById("getFeedbackBtn"); // Ensure this matches the button's id

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Check if user is logged in
    if (!window.loginManager?.isLoggedIn) {
      alert("Please sign in to upload your resume");
      return;
    }

    if (!fileInput.files.length) {
      uploadStatus.innerHTML =
        '<span class="text-danger">No file selected!</span>';
      return;
    }

    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    try {
      uploadStatus.innerHTML = '<span class="text-muted">Uploading...</span>';

      const response = await fetch("http://localhost:3002/api/resumes/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Add credentials for authentication
      });

      if (response.ok) {
        const data = await response.json();
        uploadStatus.innerHTML =
          '<span class="text-success">File uploaded successfully!</span>';

        // Update the extracted text area with the extracted content
        extractedTextArea.value = data.extractedText || "No text extracted.";

        // Show the "Get Your Instant Feedback" button
        getFeedbackBtn.classList.remove("d-none");
      } else {
        const error = await response.json();
        uploadStatus.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      uploadStatus.innerHTML =
        '<span class="text-danger">An error occurred while uploading the file.</span>';
    }
  });
}

//module.exports = { handleFileUpload };
export function handleJobDescriptionUpload() {
  const jobFileInput = document.getElementById("jobFile");
  const jobDescriptionArea = document.getElementById("jobDescription");
  const uploadJobBtn = document.getElementById("uploadJobBtn");

  uploadJobBtn.addEventListener("click", async () => {
    // Check if user is logged in
    if (!window.loginManager?.isLoggedIn) {
      alert("Please sign in to upload job description");
      return;
    }

    const file = jobFileInput.files[0];
    if (!file) {
      alert("Please select a JD file first.");
      return;
    }

    console.log(" JD file selected:", file.name);

    const formData = new FormData();
    formData.append("jobFile", file);

    try {
      console.log(" Sending JD file to backend...");
      const response = await fetch("http://localhost:3002/api/jobs/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Add credentials for authentication
      });

      if (response.ok) {
        const data = await response.json();
        jobDescriptionArea.value = data.extractedText || "No text extracted.";
        console.log("✅ JD uploaded and text extracted.");
      } else {
        const error = await response.text();
        alert("Upload failed: " + error);
      }
    } catch (err) {
      console.error("Job description upload error:", err);
      alert("An error occurred while uploading the job description.");
    }
  });
}
