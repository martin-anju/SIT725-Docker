export function handleFileUpload() {
  const form = document.getElementById("resumeForm");
  const fileInput = document.getElementById("resumeFile");
  const uploadStatus = document.getElementById("uploadStatus");
  const uploadProgress = document.getElementById("uploadProgress");
  const progressBar = uploadProgress.querySelector(".progress-bar");
  const extractedTextArea = document.getElementById("extractedText");
  const getFeedbackBtn = document.getElementById("getFeedbackBtn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!window.loginManager?.isLoggedIn) {
      alert("Please sign in to upload your resume");
      return;
    }

    if (!fileInput.files.length) {
      uploadStatus.innerHTML = '<span class="text-danger">No file selected!</span>';
      return;
    }

    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    // Reset progress bar and status
    uploadProgress.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.setAttribute("aria-valuenow", 0);
    progressBar.textContent = "0%";
    uploadStatus.classList.remove("d-none");
    uploadStatus.innerHTML = '<span class="text-muted">Uploading...</span>';

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3002/api/resumes/upload", true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = percentComplete + "%";
        progressBar.setAttribute("aria-valuenow", percentComplete);
        progressBar.textContent = percentComplete + "%";
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          uploadStatus.innerHTML = '<span class="text-success">File uploaded successfully!</span>';

          // Store feedback session ID
          localStorage.setItem("currentFeedbackSessionId", data.feedbackSessionId);
          console.log("🟦 Feedback session ID stored:", data.feedbackSessionId);

          // Update extracted text
          extractedTextArea.value = data.extractedText || "No text extracted.";

          // Show the feedback button
          getFeedbackBtn.classList.remove("d-none");
        } catch (err) {
          uploadStatus.innerHTML = '<span class="text-danger">Error parsing server response.</span>';
          console.error(err);
        }
      } else {
        let errorMsg = `Upload failed with status ${xhr.status}`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.message) errorMsg = errData.message;
        } catch {
          // ignore parse error
        }
        uploadStatus.innerHTML = `<span class="text-danger">${errorMsg}</span>`;
      }
      // Hide progress bar after a short delay
      setTimeout(() => uploadProgress.classList.add("d-none"), 1500);
    };

    xhr.onerror = () => {
      uploadStatus.innerHTML =
        '<span class="text-danger">An error occurred while uploading the file.</span>';
      uploadProgress.classList.add("d-none");
    };

    xhr.send(formData);
  });
}

export function handleJobDescriptionUpload() {
  const jobFileInput = document.getElementById("jobFile");
  const jobDescriptionArea = document.getElementById("jobDescription");
  const uploadJobBtn = document.getElementById("uploadJobBtn");
  const uploadJobProgress = document.getElementById("uploadJobProgress");
  const progressBar = uploadJobProgress.querySelector(".progress-bar");
  const uploadJobStatus = document.getElementById("uploadJobStatus");

  uploadJobBtn.addEventListener("click", () => {
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

    // Reset progress bar and status
    uploadJobProgress.classList.remove("d-none");
    progressBar.style.width = "0%";
    progressBar.setAttribute("aria-valuenow", 0);
    progressBar.textContent = "0%";
    uploadJobStatus.classList.remove("d-none");
    uploadJobStatus.innerHTML = '<span class="text-muted">Uploading...</span>';

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3002/api/jobs/upload", true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = percentComplete + "%";
        progressBar.setAttribute("aria-valuenow", percentComplete);
        progressBar.textContent = percentComplete + "%";
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          jobDescriptionArea.value = data.extractedText || "No text extracted.";
          uploadJobStatus.innerHTML = '<span class="text-success">File uploaded successfully!</span>';
          console.log("✅ JD uploaded and text extracted.");
        } catch (err) {
          uploadJobStatus.innerHTML = '<span class="text-danger">Error parsing server response.</span>';
          console.error(err);
        }
      } else {
        let errorMsg = `Upload failed with status ${xhr.status}`;
        try {
          const errData = JSON.parse(xhr.responseText);
          if (errData.message) errorMsg = errData.message;
        } catch {
          // ignore parse error
        }
        uploadJobStatus.innerHTML = `<span class="text-danger">${errorMsg}</span>`;
      }
      // Hide progress bar and status after short delay
      setTimeout(() => uploadJobProgress.classList.add("d-none"), 1500);
      setTimeout(() => uploadJobStatus.classList.add("d-none"), 1500);
    };

    xhr.onerror = () => {
      uploadJobStatus.innerHTML =
        '<span class="text-danger">An error occurred while uploading the file.</span>';
      uploadJobProgress.classList.add("d-none");
    };

    xhr.send(formData);
  });
}
