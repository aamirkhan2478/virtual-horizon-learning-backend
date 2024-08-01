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

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videos", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  createResource
);
router.get("/all", getResources);
router.get("/:id/show", getResource);
router.delete("/:id/delete", deleteResource);
router.put("/:id/update", updateResource);
router.post("/assign", assignResource);
router.post("/payment", makePayment);
router.get("/session/:id", getSession);
router.get("/user-resources", getUserResources);

module.exports = router;
