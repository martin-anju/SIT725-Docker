import { showToast } from "./toast.js";

// public/js/jdHistory.js

// Store JD sessions globally if needed later
let jdFiles = [];

export async function fetchJobDescriptions() {
  try {
    const response = await fetch("http://localhost:3002/api/jobs/history", {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch JD history");

    const data = await response.json();
    jdFiles = data;
    displayJobDescriptions(data); //
    return data; //
  } catch (error) {
    showToast("Error fetching job description history.", "error");
    return []; //
  }
}

export function displayJobDescriptions(jobDescriptions) {
  const container = document.getElementById("jdHistoryContainer");
  container.innerHTML = ""; // Clear previous items

  if (!jobDescriptions.length) {
    container.innerHTML =
      "<p class='text-muted'>No job descriptions uploaded.</p>";
    return;
  }

  jobDescriptions.forEach((job) => {
    const card = document.createElement("div");
    card.className =
      "session-item p-2 border-bottom d-flex justify-content-between align-items-center";

    const title = document.createElement("div");
    title.textContent = job.filename;
    title.className = "text-truncate";
    title.style.maxWidth = "140px";

    const controls = document.createElement("div");
    controls.className = "d-flex gap-2";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.className = "btn btn-outline-primary btn-sm";
    viewBtn.onclick = () => {
      window.open(`http://localhost:3002/api/resumes/${job._id}`, "_blank");
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-outline-danger btn-sm";
    deleteBtn.onclick = () => deleteJobDescription(job._id);

    controls.appendChild(viewBtn);
    controls.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(controls);

    container.appendChild(card);
  });
}

window.deleteJobDescription = async function (jobId) {
  if (!confirm("Are you sure you want to delete this job description?")) return;

  try {
    const response = await fetch(`http://localhost:3002/api/jobs/${jobId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      showToast("Job description deleted.", "success");
      const updatedList = await fetchJobDescriptions();
      displayJobDescriptions(updatedList);
    } else {
      showToast("Failed to delete the job description.", "error");
    }
  } catch (err) {
    console.error("Error deleting job description:", err);
    showToast("Something went wrong.", "error");
  }
};

// Global so you can open JD in new tab
window.viewJD = function (fileId) {
  window.open(`http://localhost:3002/api/resumes/${fileId}`, "_blank");
};
