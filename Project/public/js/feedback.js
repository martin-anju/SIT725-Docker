import { updateChart } from "./chart.js";

export function handleFeedback() {
  const getFeedbackBtn = document.getElementById("getFeedbackBtn");
  const feedbackResult = document.getElementById("feedbackResult");

  getFeedbackBtn.addEventListener("click", async () => {
    const extractedTextArea = document.getElementById("extractedText");
    const jobDescriptionArea = document.getElementById("jobDescription");

    const resumeText = extractedTextArea.value?.trim();
    const jobDescription = jobDescriptionArea.value?.trim();

    console.log("🟦 Resume Text Length:", resumeText.length);
    console.log("🟩 Job Description Length:", jobDescription.length);

    if (!resumeText || !jobDescription) {
      alert("Both resume text and job description are required.");
      return;
    }

    try {
      console.log("Sending request to backend...");
      const response = await fetch(
        "http://localhost:3002/api/resumes/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const scores = data.evaluation.scores || {};
        const explanation =
          data.evaluation.explanation || "No explanation provided.";

        feedbackResult.innerHTML = `<span class="text-success">${
          data.evaluation?.message || "Evaluation completed."
        }</span>`;

        const explanationArea = document.getElementById("explanationArea");
        explanationArea.innerHTML = `<h5 class="text-primary mt-4">Key Results</h5>`;

        // Try parsing the explanation text as JSON
        try {
          const explanationObj = JSON.parse(`{${explanation}}`);

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
        } catch (err) {
          explanationArea.innerHTML += `<pre>${explanation}</pre>`;
          console.error("Failed to parse explanation JSON:", err);
        }

        updateChart(scores);
        // Show missing keywords
        const missing = data.evaluation.missingKeywords || [];
        console.log("🔍 Missing Keywords Received:", missing);
        const summaryText = document.getElementById("summaryText");
        console.log("📌 summaryText exists:", !!summaryText);

        if (summaryText) {
          if (missing.length) {
            const tagList = missing
              .map(
                (word) =>
                  `<span class="badge bg-secondary me-1 mb-1">${word}</span>`
              )
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
