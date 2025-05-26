// Store sessions globally
let sessions = [];

export async function fetchUserSessions() {
  try {
    const response = await fetch(
      "http://localhost:3002/api/feedback-sessions/user/sessions",
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      const sessionsData = await response.json();
      sessions = sessionsData; // Store sessions data
      return sessionsData;
    } else {
      throw new Error("Failed to fetch sessions");
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}

// Function to display sessions in the UI
export function displaySessions(sessionsData) {
  sessions = sessionsData; // Store sessions data
  const sessionsContainer = document.getElementById("sessionsContainer");
  if (!sessionsContainer) return;

  sessionsContainer.innerHTML = sessions
    .map(
      (session) => `
    <div class="session-item p-2 border-bottom" 
         onclick="window.showSessionDetail('${session._id}')" 
         style="cursor: pointer;">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <small class="text-muted">${new Date(
            session.createdAt
          ).toLocaleString()}</small>
          <div class="mt-1">
            <span class="badge ${
              session.feedback.status === "completed"
                ? "bg-success"
                : "bg-warning"
            }">
              ${session.feedback.status}
            </span>
          </div>
        </div>
        ${
          session.feedback.scores
            ? `
          <div class="text-end">
            <small class="text-muted">Score: ${
              session.feedback.scores.Relevance || "N/A"
            }</small>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");
}

// Make the function globally available
window.showSessionDetail = function (sessionId) {
  const session = sessions.find((s) => s._id === sessionId);
  if (!session) return;

  const modalContent = document.getElementById("sessionDetailContent");
  modalContent.innerHTML = `
    <div class="session-detail">
      <div class="mb-3">
        <h6>Status</h6>
        <span class="badge ${
          session.feedback.status === "completed" ? "bg-success" : "bg-warning"
        }">
          ${session.feedback.status}
        </span>
      </div>
      
      ${
        session.resumeId
          ? `
        <div class="mb-3">
          <h6>Resume</h6>
          <button class="btn btn-primary btn-sm" onclick="viewResume('${session.resumeId}')">
            <i class="bi bi-file-earmark-text"></i> View Resume
          </button>
        </div>
      `
          : ""
      }
      
      ${
        session.jobDescription
          ? `
        <div class="mb-3">
          <h6>Job Description</h6>
            <textarea class="form-control" rows="5" readonly>${session.jobDescription}</textarea>
        </div>
      `
        : ""
      }

      ${
        session.feedback.scores
          ? `
        <div class="mb-3">
          <h6>Scores</h6>
          <div class="row">
            <div class="col-md-4">
              <p><strong>Technical Skills:</strong> ${session.feedback.scores["Technical Skills"]}</p>
            </div>
            <div class="col-md-4">
              <p><strong>Leadership:</strong> ${session.feedback.scores.Leadership}</p>
            </div>
            <div class="col-md-4">
              <p><strong>Relevance:</strong> ${session.feedback.scores.Relevance}</p>
            </div>
          </div>
        </div>
      `
          : ""
      }
      
      ${
        session.feedback.explanation
          ? `
        <div class="mb-3">
          <h6>Feedback</h6>
          <div id="explanationArea">
            <h5 class="text-primary mt-4">Key Results</h5>
            ${(() => {
              try {
                const explanationObj = JSON.parse(
                  `{${session.feedback.explanation}}`
                );
                return Object.entries(explanationObj)
                  .map(
                    ([key, value]) => `
                      <div class="card mb-3">
                        <div class="card-body">
                          <h6 class="card-title text-primary">${key}</h6>
                          <p class="card-text text-muted">${value}</p>
                        </div>
                      </div>
                    `
                  )
                  .join("");
              } catch (err) {
                console.error("Failed to parse explanation JSON:", err);
                return `<pre>${session.feedback.explanation}</pre>`;
              }
            })()}
          </div>
        </div>
      `
          : ""
      }
      
      ${
        session.feedback.missingKeywords
          ? `
        <div class="mb-3">
          <h6>Missing Keywords</h6>
          <div class="d-flex flex-wrap gap-1">
            ${session.feedback.missingKeywords
              .map(
                (keyword) =>
                  `<span class="badge bg-secondary">${keyword}</span>`
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;

  // Initialize and show the modal
  const modal = new bootstrap.Modal(
    document.getElementById("sessionDetailModal")
  );
  modal.show();
};


function displayJDList(jds) {
  const container = document.getElementById("jdHistoryContainer");
  container.innerHTML = jds
    .map(
      (jd) => `
        <div class="p-2 border-bottom d-flex justify-content-between">
          <span>${jd.filename}</span>
          <button class="btn btn-sm btn-outline-primary" onclick="viewJD('${jd._id}')">View</button>
        </div>
      `
    )
    .join("");
}

window.viewJD = function (fileId) {
  window.open(`http://localhost:3002/api/resumes/${fileId}`, "_blank");
};


// Add function to view resume
window.viewResume = async function (resumeId) {
  try {
    // Open resume in new tab
    window.open(`http://localhost:3002/api/resumes/${resumeId}`, "_blank");
  } catch (error) {
    console.error("Error viewing resume:", error);
    alert("Error viewing resume. Please try again.");
  }
};
