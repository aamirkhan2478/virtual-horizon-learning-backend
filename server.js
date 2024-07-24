const express = require("express");
const http = require("http");
const cors = require("cors");
const userRouter = require("./src/routes/user.routes.js");
const resourceRouter = require("./src/routes/resource.routes.js");
const auth = require("./src/middlewares/auth.middleware.js");
const {
  errorHandler,
  notFound,
} = require("./src/middlewares/error.middleware.js");
const dotenv = require("dotenv");
const db = require("./src/database/db.js");

// Initialize database
db();

// Config environment variables
dotenv.config();

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
    ],
    credentials: true,
  })
);

// Starting endpoint
app.get("/", (_req, res) => {
  res.send("<h1 style='color:green;'>Hurrah! Server is running.</h1>");
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/resource", auth, resourceRouter);

app.use(notFound);
app.use(errorHandler);

// Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
