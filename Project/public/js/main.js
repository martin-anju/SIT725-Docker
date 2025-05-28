import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { handleFileUpload } from "./upload.js";
import { handleFeedback } from "./feedback.js";
import { initializeChart } from "./chart.js";
import { initializeNotifications } from "./notification.js";
import { handleJobDescriptionUpload } from "./upload.js";
import LoginManager from "./login.js";
import { fetchUserSessions, displaySessions } from "./sessions.js";
import { fetchJobDescriptions } from "./jdHistory.js";
import { showToast } from "./toast.js";

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

// Make deleteResume accessible to the frontend
window.deleteResume = function (resumeId) {
  fetch(`http://localhost:3002/api/resumes/${resumeId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        showToast("Resume deleted successfully.", "success");
        fetchResumes(); // Refresh
      }
    })
    .catch((err) => {
      console.error("Error deleting resume:", err);
      showToast("Error deleting resume.", "error");
    });
};

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

// Function to check if the user is logged in (using localStorage as an example)
function checkIfLoggedIn() {
  // Check for user login status (can be replaced with session cookies or token validation)
  return localStorage.getItem("isLoggedIn") === "true"; // Example using localStorage
}

// Function to show or hide login/logout links based on login status
function updateLoginLogoutLinks(name = "") {
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const userName = document.getElementById("userName");

  const isLoggedIn = checkIfLoggedIn();

  if (isLoggedIn) {
    if (loginLink) loginLink.classList.add("d-none");
    if (logoutLink) logoutLink.classList.remove("d-none");
    if (userName) userName.textContent = name || "User";
  } else {
    if (loginLink) loginLink.classList.remove("d-none");
    if (logoutLink) logoutLink.classList.add("d-none");
    if (userName) userName.textContent = "";
  }
}

function logoutUser() {
  fetch("/auth/logout", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
    .then((res) => {
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        return res.json();
      }
      throw new Error("Unexpected response format");
    })
    .then((data) => {
      if (data.success) {
        localStorage.setItem("isLoggedIn", "false");
        window.location.href = "/";
      } else {
        showToast("Logout failed. Please try again", "error");
      }
    })
    .catch((err) => {
      console.error("Logout error:", err);
      showToast("Logout failed. Please try again", "error");
    });
}

// Function to handle PDF Download
async function handleDownloadPdf() {
  const feedbackContainer = document.getElementById("feedbackContainer");

  if (
    !feedbackContainer ||
    !document.getElementById("feedbackResult").innerHTML.trim()
  ) {
    showToast("No feedback to export!", "error");
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
    showToast("An error occured while generating the PDF", "error");
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
  fetchJobDescriptions();

  // Load Navbar
  if (!navbarLoaded) {
    fetch("components/navbar.html")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("navbar").innerHTML = html;
        navbarLoaded = true;

        requestAnimationFrame(() => {
          fetch("/auth/user")
            .then((res) => res.json())
            .then((data) => {
              localStorage.setItem(
                "isLoggedIn",
                data.loggedIn ? "true" : "false"
              );
              updateLoginLogoutLinks(data.name || "User");

              const logoutBtn = document.getElementById("logoutBtn");
              if (logoutBtn) {
                logoutBtn.addEventListener("click", (e) => {
                  e.preventDefault();
                  logoutUser();
                });
              }
            });
        });
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

// Function to load and display user sessions
async function loadUserSessions() {
  try {
    const sessions = await fetchUserSessions();
    displaySessions(sessions);
  } catch (error) {
    console.error("Error loading sessions:", error);
  }
}

// Call this when the page loads or when you want to refresh the sessions
document.addEventListener("DOMContentLoaded", loadUserSessions);

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("authOverlay");

  fetch("/auth/user")
    .then((res) => res.json())
    .then((data) => {
      const isLoggedIn = data.loggedIn;

      if (isLoggedIn) {
        overlay.style.display = "none"; // Hide if logged in
      } else {
        overlay.style.display = "flex"; // Show overlay
      }
    });

    let socket;

document.addEventListener("DOMContentLoaded", () => {
  // 👇 Socket connection
  socket = io("http://localhost:3002", {
    withCredentials: true,
  });

  // Fetch user info and register their socket
  fetch("/api/user")
    .then((res) => res.json())
    .then((data) => {
      if (data.loggedIn && data.name) {
        socket.emit("registerUser", data.id);
      }
    });

  // 👂 Listen for feedback notifications
  socket.on("feedbackReady", (payload) => {
    // Replace alert with a toast later if needed
    alert(payload.message || "Your resume feedback is ready!");
  });
});

  // Handle 'Skip for now'
  document.getElementById("skipBtn").addEventListener("click", () => {
    overlay.style.display = "none";
  });

  // Handle 'Create with Email' - just redirect or open another modal
  document.getElementById("createEmailBtn").addEventListener("click", () => {
    alert("Feature coming soon!");
    //showToast("Feature coming soon!", "info");
  });
});
