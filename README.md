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
```

### Installation and Setup

1. Run the Backend (Server)
   Navigate to the project root directory:

   ```bash
   cd Project
   ```

````

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
   serve -s . -l 3000  or http-server -p 3000
   ```

   Open the frontend in your browser:

   ```bash
   http://localhost:3000
   ```

### Project Structure

```
SIT725/
├── controllers/
│   └── resumeController.js  # Handles resume-related logic
├── db/
│   └── mongoConnection.js   # MongoDB connection logic
├── models/
│   └── resumeModel.js       # Handles database operations
├── public/
│   ├── components/
│   │   ├── navbar.html      # Navbar component
│   │   └── footer.html      # Footer component
│   ├── css/
│   │   └── styles.css       # Frontend styles
│   ├── js/
│   │   ├── main.js          # Main frontend logic
│   │   ├── feedback.js      # Handles feedback functionality
│   │   ├── chart.js         # Chart rendering logic
│   │   ├── notification.js  # Handles Socket.IO notifications
│   │   └── upload.js        # Handles file upload functionality
│   └── index.html           # Frontend UI
├── routers/
│   └── resumeRoutes.js      # Defines API routes for resumes
├── server.js                # Express server configuration
└── package.json             # Project dependencies
```

### Socket.IO Integration

Backend: The backend uses Socket.IO to emit a feedbackReady event to the frontend when the resume feedback is processed.

Frontend: The frontend listens for the feedbackReady event and displays a notification to the user.
````
