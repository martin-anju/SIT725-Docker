// Google OAuth login handling
class LoginManager {
  constructor() {
    this.loginButton = document.getElementById("loginBtn");
    this.logoutButton = document.getElementById("logoutBtn");
    this.userInfo = document.getElementById("userInfo");
    this.userName = document.getElementById("userName");
    this.isLoggedIn = false;

    console.log("Logout button found:", this.logoutButton); // Debug log

    this.initializeEventListeners();
    this.checkLoginStatus();
  }

  initializeEventListeners() {
    // Login button click handler
    if (this.loginButton) {
      this.loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Logout button click handler
    if (this.logoutButton) {
      console.log("Adding click listener to logout button"); // Debug log
      this.logoutButton.onclick = async (e) => {
        // Changed to onclick
        console.log("Logout button clicked"); // Debug log
        e.preventDefault();
        e.stopPropagation(); // Stop event bubbling
        await this.handleLogout();
      };
    } else {
      console.log("Logout button not found in DOM"); // Debug log
    }
  }

  async handleLogin() {
    try {
      // Redirect to Google OAuth endpoint
      window.location.href = "http://localhost:3002/auth/google";
    } catch (error) {
      console.error("Login error:", error);
      this.showNotification("Login failed. Please try again.", "error");
    }
  }

  async handleLogout() {
    console.log("Starting logout process..."); // Debug log
    try {
      console.log("Sending logout request..."); // Debug log
      const response = await fetch("http://localhost:3002/auth/logout", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("Logout response status:", response.status); // Debug log

      if (response.ok) {
        console.log("Logout successful, updating UI..."); // Debug log
        this.isLoggedIn = false;
        this.updateUI(false);
        console.log("Redirecting to home..."); // Debug log
        window.location.href = "/";
      } else {
        console.log("Logout failed with status:", response.status); // Debug log
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      this.showNotification("Logout failed. Please try again.", "error");
    }
  }

  async checkLoginStatus() {
    try {
      const response = await fetch("http://localhost:3002/api/user", {
        credentials: "include",
      });

      const data = await response.json();
      this.isLoggedIn = data.loggedIn;
      this.updateUI(data.loggedIn, data.name);
    } catch (error) {
      console.error("Error checking login status:", error);
      this.isLoggedIn = false;
      this.updateUI(false);
    }
  }

  updateUI(isLoggedIn, userName = "") {
    console.log("Updating UI - isLoggedIn:", isLoggedIn, "userName:", userName); // Debug log
    this.isLoggedIn = isLoggedIn;

    // Update login/logout buttons visibility
    if (this.loginButton) {
      this.loginButton.style.display = isLoggedIn ? "none" : "block";
      console.log("Login button display:", this.loginButton.style.display); // Debug log
    }

    if (this.logoutButton) {
      this.logoutButton.style.display = isLoggedIn ? "block" : "none";
      console.log("Logout button display:", this.logoutButton.style.display); // Debug log
    }

    // Update user info display
    if (this.userInfo) {
      this.userInfo.style.display = isLoggedIn ? "block" : "none";
      console.log("User info display:", this.userInfo.style.display); // Debug log
    }

    if (this.userName && userName) {
      this.userName.textContent = `Welcome, ${userName}`;
      console.log("Username updated to:", userName); // Debug log
    }

    // Update protected content visibility
    this.updateProtectedContent(isLoggedIn);
  }

  updateProtectedContent(isLoggedIn) {
    // Get all elements with data-protected attribute
    const protectedElements = document.querySelectorAll("[data-protected]");

    protectedElements.forEach((element) => {
      if (isLoggedIn) {
        element.classList.remove("d-none");
      } else {
        element.classList.add("d-none");
      }
    });
  }

  showNotification(message, type = "info") {
    // You can implement your own notification system here
    // For now, using alert as a simple solution
    alert(message);
  }
}

// Initialize login manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.loginManager = new LoginManager();
});

// Export for use in other files if needed
export default LoginManager;
