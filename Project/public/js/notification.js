import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

export function initializeNotifications() {
  const socket = io("http://localhost:3002"); // Replace with your server URL

  // Listen for the "feedbackReady" event
  socket.on("feedbackReady", (data) => {
    console.log(data.message); // Log the notification
    alert(data.message); // Show an alert to the user

    // Optionally, update the UI with the evaluation data
    const feedbackResult = document.getElementById("feedbackResult");
    if (feedbackResult) {
      feedbackResult.innerHTML = `<pre>${JSON.stringify(
        data.evaluation,
        null,
        2
      )}</pre>`;
    }
  });
}
