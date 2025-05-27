## Resume Evaluation Tool with Gemini

This project is a resume evaluation tool that leverages Google's Gemini AI to provide detailed feedback on resumes. Users can upload their resume (in PDF or Word format) along with a job description, and the system will analyze the resume against the job description. The feedback includes scores for technical skills, leadership qualities, and relevance, along with tailored recommendations to improve the resume.

### Socket Programming

This version of the project integrates Socket.IO to enable real-time notifications. When the backend completes processing the resume feedback, it sends a notification to the frontend to inform the user that the feedback is ready. This enhances the user experience by providing instant updates without requiring the user to refresh the page.

## Environment Variables

Create a `.env` file in the `Project` directory with the following keys. Replace the placeholder values with your own credentials:

```properties
MONGODB_URI=<your-mongodb-uri>
MONGO_USER=<your-mongodb-username>
MONGO_PASSWORD=<your-mongodb-password>
GENAI_API_KEY=<your-genai-api-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Installation and Setup

1. Run the Backend (Server)
   Navigate to the project root directory:

   ```bash
   cd Project
   ```

   Install dependencies:

   ```bash
   npm install
   ```

   Start the backend server:

   ```bash
   node server.js
   ```

2. Run the Frontend:
   Navigate to the project root directory:

   ```bash
   cd public
   ```

   Start a lightweight server

   ```bash
   http-server -p 3000
   ```

   Open the frontend in your browser:

   ```bash
   http://localhost:3000
   ```

### Project Structure

```
SIT725/
├── controllers/
│   ├── resumeController.js      # Handles resume-related logic
│   |── jobController.js         # Handles job description-related logic
|   |── resumeController.js      # Handles resume logic
|   └── userController.js        # Handles user logic
|
├── db/
│   └── mongoConnection.js       # MongoDB connection logic
|   |── feebackSessionDB.js      # feedback session schema
|   └── userDB.js                # user schema
|
├── models/
│   ├── resumeModel.js           # Handles resume database operations
│   └── jobModel.js              # Handles job description database operations
├── public/
│   ├── components/
│   │   ├── navbar.html          # Navbar component
│   │   └── footer.html          # Footer component
│   ├── css/
│   │   └── styles.css           # Frontend styles
│   ├── js/
│   │   ├── main.js              # Main frontend logic
│   │   ├── feedback.js          # Handles feedback functionality
│   │   ├── chart.js             # Chart rendering logic
|   |   |   sessions.js          # fetch/display feedback sessions
│   │   ├── notification.js      # Handles Socket.IO notifications
│   │   ├── upload.js            # Handles resume file upload
│   └── index.html               # Frontend UI
├── routers/
│   ├── resumeRoutes.js          # Defines API routes for resumes
|   ├── feebackSessionRoutes.js  # Defines API routes for feebacks
│   └── jobRoutes.js             # Defines API routes for job descriptions
├── server.js                    # Express server configuration
└── package.json                 # Project dependencies

```

### Socket.IO Integration

Backend: The backend uses Socket.IO to emit a feedbackReady event to the frontend when the resume feedback is processed.

Frontend: The frontend listens for the feedbackReady event and displays a notification to the user.


### Authentication with Google OAuth 2.0

This project includes Google OAuth 2.0 login using Passport.js Users can sign in securely using their Google account.

- The "Continue with Google" button is dymanically changed to display "Welcome, ${name}"
- The "Login" link in the navbar is replaced with a "Logout" link after login
- Session handling is managed by Express-Session and Passport.js

'''Required .env properties
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MONGODB_URI=mongodb://localhost:27017/resume-portal
'''