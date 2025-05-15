import { handleFileUpload } from "./upload.js";
import { handleFeedback } from "./feedback.js";
import { initializeChart } from "./chart.js";
import { initializeNotifications } from "./notification.js";
import { handleJobDescriptionUpload } from "./upload.js";
import LoginManager from "./login.js";

if (window._resumePortalLoaded) {
  console.warn("Resume Portal already loaded. Skipping...");
  throw new Error("Script loaded multiple times");
}
window._resumePortalLoaded = true;

// Flags to prevent duplicate loading
let navbarLoaded = false;
let footerLoaded = false;

if (!window.loginManager) {
  window.loginManager = new LoginManager();
  console.log("Login manager initialized");
}

// Function to fetch and display uploaded resumes
function fetchResumes() {
  console.log("Fetching resumes...");
  fetch("http://localhost:3002/api/resumes") // Replace with your backend URL
    .then((response) => response.json())
    .then((resumes) => {
      const resumeList = document.getElementById("resumeList");
      resumeList.innerHTML = ""; // Clear the existing list

      if (resumes.length === 0) {
        resumeList.innerHTML =
          "<li class='list-group-item'>No resumes uploaded yet.</li>";
        resumeList.innerHTML =
          "<li class='list-group-item'>No resumes uploaded yet.</li>";
      } else {
        resumes.forEach((resume) => {
          const resumeItem = document.createElement("li");
          resumeItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between"
          );
          resumeItem.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between"
          );
          resumeItem.innerHTML = `
            <span>${resume.filename}</span>
            <button class="btn btn-danger btn-sm" onclick="deleteResume('${resume._id}')">Delete</button>
          `;
          resumeList.appendChild(resumeItem);
        });
      }
    })
    .catch((err) => console.error("Error fetching resumes:", err));
}

// Function to delete a resume
function deleteResume(resumeId) {
  fetch(`http://localhost:3002/api/resumes/${resumeId}`, {
    method: "DELETE", // Use DELETE method to delete the resume
  })
    .then((response) => {
      if (response.ok) {
        alert("Resume deleted successfully");
        fetchResumes(); // Re-fetch the list after deletion
      } else {
        alert("Error deleting resume");
      }
    })
    .catch((err) => console.error("Error deleting resume:", err));
}

// Function to check if the user is logged in (using localStorage as an example)
function checkIfLoggedIn() {
  // Check for user login status (can be replaced with session cookies or token validation)
  return localStorage.getItem("isLoggedIn") === "true"; // Example using localStorage
}

// Function to show or hide login/logout links based on login status
function updateLoginLogoutLinks() {
  const isLoggedIn = checkIfLoggedIn();

  if (isLoggedIn) {
    document.getElementById("loginLink").style.display = "none"; // Hide Login link
    document.getElementById("loginLink").style.display = "none"; // Hide Login link
    document.getElementById("logoutLink").style.display = "block"; // Show Logout link
  } else {
    document.getElementById("loginLink").style.display = "block"; // Show Login link
    document.getElementById("logoutLink").style.display = "none"; // Hide Logout link
    document.getElementById("loginLink").style.display = "block"; // Show Login link
    document.getElementById("logoutLink").style.display = "none"; // Hide Logout link
  }
}

// Function to handle user logout
function logoutUser() {
  // Clear the login status and redirect to homepage
  localStorage.setItem("isLoggedIn", "false"); // Example of logging out
  window.location.href = "/"; // Redirect to homepage after logout
}

// Function to handle PDF Download
async function handleDownloadPdf() {
  const feedbackContainer = document.getElementById("feedbackContainer");

  if (
    !feedbackContainer ||
    !document.getElementById("feedbackResult").innerHTML.trim()
  ) {
    alert("No feedback to export!");
    return;
  }

  try {
    const canvas = await html2canvas(feedbackContainer, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight() - 20;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, pdfWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("ResumeFeedback.pdf");
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("An error occured while generating the PDF");
  }
}

// Initialize components
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing main.js...");

  // Initialize other components
  initializeChart();
  handleFileUpload();
  handleFeedback();
  initializeNotifications();
  handleJobDescriptionUpload();

  // Load Navbar
  if (!navbarLoaded) {
    fetch("components/navbar.html")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("navbar").innerHTML = html;
        navbarLoaded = true; // Mark as loaded
        updateLoginLogoutLinks(); // Update login/logout links based on login status
        window.loginManager = new LoginManager();
      })
      .catch((err) => console.error("Error loading navbar:", err));
  }

  // Load Footer
  if (!footerLoaded) {
    fetch("components/footer.html")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("footer").innerHTML = html;
        footerLoaded = true; // Mark as loaded
      })
      .catch((err) => console.error("Error loading footer:", err));
  }

  // Fetch and display the uploaded resumes when the page is loaded
  fetchResumes();

  // Handle logout button click
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser(); // Call logout function
    });
  }

  // Handle download PDF button
  const downloadBtn = document.getElementById("downloadPdfBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", handleDownloadPdf);
    const feedbackResult = document.getElementById("feedbackResult");
    const observer = new MutationObserver(() => {
      if (feedbackResult.innerHTML.trim()) {
        downloadBtn.classList.remove("d-none");
      } else {
        downloadBtn.classList.add("d-none");
      }
    });
    observer.observe(feedbackResult, { childList: true, subtree: true });
  }
});
