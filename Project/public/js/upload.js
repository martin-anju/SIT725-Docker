export function handleFileUpload() {
  const form = document.getElementById("resumeForm");
  const fileInput = document.getElementById("resumeFile");
  const uploadStatus = document.getElementById("uploadStatus");
  const extractedTextArea = document.getElementById("extractedText");
  const getFeedbackBtn = document.getElementById("getFeedbackBtn"); // Ensure this matches the button's id

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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
