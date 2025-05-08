import { handleFileUpload } from "./upload.js";
import { handleFeedback } from "./feedback.js";
import { initializeChart } from "./chart.js";
import { initializeNotifications } from "./notification.js";
import { handleJobDescriptionUpload } from "./upload.js";

if (window._resumePortalLoaded) {
  console.warn("Resume Portal already loaded. Skipping...");
  throw new Error("Script loaded multiple times");
}
window._resumePortalLoaded = true;

// Flags to prevent duplicate loading
let navbarLoaded = false;
let footerLoaded = false;

// Initialize components
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing main.js...");

  // Initialize other components
  initializeChart();
  handleFileUpload();
  handleFeedback();
  initializeNotifications();
  handleJobDescriptionUpload();
/*
  // Load Navbar
  if (!navbarLoaded) {
    fetch("components/navbar.html")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("navbar").innerHTML = html;
        navbarLoaded = true; // Mark as loaded
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
  */
});
