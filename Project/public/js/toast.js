export function showToast(message, type = "info") {
  const toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    console.error("Toast container not found in the DOM.");
    return;
  }

  // Map type to Bootstrap background classes
  const typeClasses = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    info: "bg-info text-white",
    warning: "bg-warning text-dark",
  };

  const toastClass = typeClasses[type] || typeClasses.info;

  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
      <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${toastClass}">
          <strong class="me-auto">${
            type.charAt(0).toUpperCase() + type.slice(1)
          }</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;

  // Append toast to container
  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  // Initialize and show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 5000, // 5 seconds
  });
  toast.show();

  // Remove toast from DOM after it's hidden
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}
