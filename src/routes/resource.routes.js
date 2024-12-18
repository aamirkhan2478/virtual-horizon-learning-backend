const express = require("express");
const upload = require("../middlewares/multer.middleware.js");
const {
  createResource,
  getResources,
  getResource,
  deleteResource,
  updateResource,
  assignResource,
  makePayment,
  getSession,
  getUserResources,
  getLatestResources,
  getQuizzes,
  generateQuiz,
  saveQuiz,
  saveAssignment,
  getAssignments,
  getSubmittedAssignments,
  submitAssignment,
  updateQuiz,
  updateAssignment,
  getScores,
} = require("../controllers/resources.controllers.js");

// import auth middleware for authentication
const auth = require("../middlewares/auth.middleware.js");

// Create a new router
const router = express.Router();

// Handle create resource
router.post(
  "/create",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videos", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  auth,
  createResource
);

// Handle get resources
router.get("/all", auth, getResources);

// Handle get resource
router.get("/:id/show", auth, getResource);

// Handle delete resource
router.delete("/:id/delete", auth, deleteResource);

// Handle update resource
router.put("/:id/update", auth, updateResource);

// Handle assign resource
router.post("/assign", auth, assignResource);

// Handle make payment
router.post("/payment", auth, makePayment);

// Handle get session
router.get("/session/:id", auth, getSession);

// Handle get user resources
router.get("/user-resources", auth, getUserResources);

//Handle get latest 6 resources
router.get("/latest", getLatestResources);

// Handle get quizzes
router.get("/quizzes", auth, getQuizzes);

// Handle ai quiz
router.post("/generate-quiz", auth, generateQuiz);

// Handle save quiz
router.post("/save-quiz", auth, saveQuiz);

// Handle update quiz
router.post("/update-quiz", auth, updateQuiz);

// Add multer middleware to handle single file upload
router.post("/save-assignment", upload.single("file"), auth, saveAssignment);

// Handle get assignments
router.get("/assignments", auth, getAssignments);

// Handle get submitted assignments
router.get("/submitted-assignments", auth, getSubmittedAssignments);

// Handle submit assignment
router.post(
  "/submit-assignment",
  upload.single("file"),
  auth,
  submitAssignment
);

router.post("/update-assignment", auth, updateAssignment);

router.get("/scores", auth, getScores);

// Export the router
module.exports = router;
