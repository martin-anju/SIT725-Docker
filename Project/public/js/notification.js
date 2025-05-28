import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { showToast } from "./toast.js";

export function initializeNotifications() {
  const socket = io("http://localhost:3002"); // Replace with your server URL

  // Step 1: Register this socket with the logged-in user's ID
  fetch("/api/user")
    .then((res) => res.json())
    .then((data) => {
      if (data.loggedIn && data.id) {
        console.log(" Registering socket with user ID:", data.id);
        socket.emit("registerUser", data.id); // Send user ID to backend
      } else {
        console.warn("⚠️ User not logged in or ID missing");
      }
    });

  // Step 2: Listen for the "feedbackReady" event specific to this user
  socket.on("feedbackReady", (data) => {
    console.log(data.message); // Log the notification
    //alert(data.message); // Show an alert to the user
    showToast(data.message, "success"); // Show an alert to the user

    // Optionally, update the UI with the evaluation data
    const feedbackResult = document.getElementById("feedbackResult");
    if (feedbackResult && data.evaluation) {
      feedbackResult.innerHTML = `<pre>${JSON.stringify(
        data.evaluation,
        null,
        2
      )}</pre>`;
    }
  });
}
