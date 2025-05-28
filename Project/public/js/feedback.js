import { updateChart } from "./chart.js";

export function handleFeedback() {
  const getFeedbackBtn = document.getElementById("getFeedbackBtn");
  if (!getFeedbackBtn) {
    console.error("Get Feedback button not found!");
    return;
  }
  const feedbackResult = document.getElementById("feedbackResult");
  const explanationArea = document.getElementById("explanationArea");
  const summaryText = document.getElementById("summaryText");

  getFeedbackBtn.addEventListener("click", async () => {
    const extractedTextArea = document.getElementById("extractedText");
    const jobDescriptionArea = document.getElementById("jobDescription");

    if (!extractedTextArea || !jobDescriptionArea) {
      alert("Resume text or job description input missing.");
      return;
    }

    const resumeText = extractedTextArea.value.trim();
    const jobDescription = jobDescriptionArea.value.trim();
    const feedbackSessionId = localStorage.getItem("currentFeedbackSessionId");

    console.log("🟦 Resume Text Length:", resumeText.length);
    console.log("🟩 Job Description Length:", jobDescription.length);
    console.log("🟦 Feedback Session ID:", feedbackSessionId);

    if (!resumeText || !jobDescription) {
      alert("Both resume text and job description are required.");
      return;
    }

    // Show loading message or progress indicator
    feedbackResult.innerHTML = "<em>Evaluating, please wait...</em>";

    try {
      const response = await fetch(
        "http://localhost:3002/api/resumes/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText,
            jobDescription,
            feedbackSessionId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const scores = data.evaluation.scores || {};
        const explanation = data.evaluation.explanation || "No explanation provided.";

        feedbackResult.innerHTML = `<span class="text-success">${
          data.evaluation?.message || "Evaluation completed."
        }</span>`;

        explanationArea.innerHTML = `<h5 class="text-primary mt-4">Key Results</h5>`;

        let explanationObj = {};
        try {
          explanationObj = JSON.parse(explanation);
        } catch (err) {
          explanationArea.innerHTML += `<pre>${explanation}</pre>`;
          console.error("Failed to parse explanation JSON:", err);
        }

        if (typeof explanationObj === "object" && Object.keys(explanationObj).length > 0) {
          for (const [key, value] of Object.entries(explanationObj)) {
            const card = document.createElement("div");
            card.className = "card mb-3";
            card.innerHTML = `
              <div class="card-body">
                <h6 class="card-title text-primary">${key}</h6>
                <p class="card-text text-muted">${value}</p>
              </div>
            `;
            explanationArea.appendChild(card);
          }
        }

        updateChart(scores);

        const missing = data.evaluation.missingKeywords || [];
        console.log("🔍 Missing Keywords Received:", missing);

        if (summaryText) {
          if (missing.length) {
            const tagList = missing
              .map((word) => `<span class="badge bg-secondary me-1 mb-1">${word}</span>`)
              .join(" ");
            summaryText.innerHTML = `<strong>Missing Keywords:</strong><br>${tagList}`;
          } else {
            summaryText.innerHTML = `<strong>No missing keywords found!</strong>`;
          }
        }
      } else {
        const error = await response.json();
        feedbackResult.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      feedbackResult.innerHTML =
        '<span class="text-danger">An error occurred while evaluating the resume.</span>';
    }
  });
}
