// Initiate the server and connect to the database
require("dotenv").config();

// import express for building the server
const express = require("express");

// import http for creating the server
const http = require("http");

// import cors for allowing requests from the client
const cors = require("cors");

// import routes for routing
const userRouter = require("./src/routes/user.routes.js");
const resourceRouter = require("./src/routes/resource.routes.js");
const notificationRouter = require("./src/routes/notification.routes.js");
const meetingRouter = require("./src/routes/meeting.routes.js");

// import auth middleware for authentication
const auth = require("./src/middlewares/auth.middleware.js");
const {
  errorHandler,
  notFound,
} = require("./src/middlewares/error.middleware.js");

// import database for connecting to the database
const db = require("./src/database/db.js");
const { sendEmail } = require("./src/utils/mailer.utils.js");

// Initialize database
db();

// Initialize express
const app = express();

// Initialize socket.io
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("./public"));

// CORS middleware to allow requests from client
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL_DEVELOPMENT,
      process.env.CLIENT_URL_PRODUCTION,
      "http://127.0.0.1:3000",
    ],
  })
);

// Starting endpoint
app.get("/", (_req, res) => {
  res.send("<h1 style='color:green;'>Hurrah! Server is running.</h1>");
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/resource", resourceRouter);
app.use("/api/notification", auth, notificationRouter);
app.use("/api/meeting", auth, meetingRouter);

// Contact form
app.post("/api/contact", async (req, res) => {
  const { name, email, message, subject } = req.body;

  // Send email
  const mailResponse = await sendEmail({
    email,
    emailType: "contact",
    name,
    message,
    subject,
  });

  // Return response
  res.json({ message: "Email sent successfully", mailResponse });
});

app.use(notFound);
app.use(errorHandler);

// Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
