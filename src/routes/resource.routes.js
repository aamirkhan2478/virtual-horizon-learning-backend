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
} = require("../controllers/resources.controllers.js");

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
  createResource
);

// Handle get resources
router.get("/all", getResources);

// Handle get resource
router.get("/:id/show", getResource);

// Handle delete resource
router.delete("/:id/delete", deleteResource);

// Handle update resource
router.put("/:id/update", updateResource);

// Handle assign resource
router.post("/assign", assignResource);

// Handle make payment
router.post("/payment", makePayment);

// Handle get session
router.get("/session/:id", getSession);

// Handle get user resources
router.get("/user-resources", getUserResources);

// Export the router
module.exports = router;
