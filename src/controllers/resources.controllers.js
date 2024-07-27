const Resources = require("../models/resources.model");
const User = require("../models/user.model");
const UserResource = require("../models/user_resources.model");

// @route   POST /api/resource/create
// @desc    Create New Resource
// @access  Private
const createResource = async (req, res) => {
  // Get data from request body
  const { title, description, type, price } = req.body;

  // Get files from request
  const files = req.files;

  // Check if fields are not empty
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Please enter all fields!", success: false });
  }

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  // Check if files are available
  if (!files) {
    return res
      .status(400)
      .json({ message: "Please select an file!", success: false });
  }

  // Get thumbnail image
  const thumbnail = [];
  if (files.thumbnail) {
    files.thumbnail.map((file) =>
      thumbnail.push(`${basePath}${file.filename}`)
    );
  }

  // Thumbnail is required
  if (!thumbnail.length) {
    return res
      .status(400)
      .json({ message: "Please select an image!", success: false });
  }

  // Check if video or pdf files are available
  const videos = [];
  const pdf = [];
  if (type === "Video") {
    if (files.video) {
      files.video.map((file) => videos.push(`${basePath}${file.filename}`));
    }
  } else {
    if (files.pdf) {
      files.pdf.map((file) => pdf.push(`${basePath}${file.filename}`));
    }
  }

  try {
    const resource = await Resources.query().insert({
      title: title,
      description: description,
      thumbnail: thumbnail[0],
      videos: videos.length ? JSON.stringify(videos) : [],
      pdf: pdf.length ? pdf[0] : "",
      type: type,
      price: price,
    });

    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json(err);
  }
};

// @route   GET /api/resource/all
// @desc    Show All Resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const resources = await Resources.query();
    res.status(200).json(resources);
  } catch (err) {
    res.status(400).json(err);
  }
};

// @route   GET /api/resource/:id/show
// @desc    Show Specific Resource
// @access  Private
const getResource = async (req, res) => {
  const id = req.params.id;
  try {
    const resource = await Resources.query().findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found!" });
    }
    res.status(200).json(resource);
  } catch (err) {
    res.status(400).json(err);
  }
};

// @route   DELETE /api/resource/:id/delete
// @desc    Delete Specific Resource
// @access  Private
const deleteResource = async (req, res) => {
  const id = req.params.id;
  try {
    const resource = await Resources.query().deleteById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found!" });
    }
    res.status(200).json({ message: "Resource deleted successfully!" });
  } catch (err) {
    res.status(400).json(err);
  }
};

// @route   PUT /api/resource/:id/update
// @desc    Update The Resource
// @access  Private
const updateResource = async (req, res) => {
  const id = req.params.id;
  const { title, description, type, price } = req.body;
  const files = req.files;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Please enter all fields!", success: false });
  }

  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  if (!files) {
    return res
      .status(400)
      .json({ message: "Please select an file!", success: false });
  }

  const thumbnail = `${basePath}${files.thumbnail[0].filename}`;

  if (!thumbnail) {
    return res
      .status(400)
      .json({ message: "Please select an image!", success: false });
  }

  const video = files.video
    ? files.video.map((file) => `${basePath}${file.filename}`)
    : "";
  const pdf = files.pdf
    ? files.pdf.map((file) => `${basePath}${file.filename}`)
    : "";

  try {
    const resource = await Resources.query().findById(id).patch({
      title: title,
      description: description,
      thumbnail: thumbnail[0],
      video: video,
      pdf: pdf[0],
      type: type,
      price: price,
    });

    res.status(200).json(resource);
  } catch (err) {
    res.status(400).json(err);
  }
};

// @route   POST /api/resource/assign
// @desc    Assign Resource By Teacher User
// @access  Private
const assignResource = async (req, res) => {
  const { userId, resourceId } = req.body;

  if (!userId || !resourceId) {
    return res
      .status(400)
      .json({ message: "Please enter all fields!", success: false });
  }

  try {
    const user = await User.query().findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const resource = await Resources.query().findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found!" });
    }

    const userResource = await UserResource.query().insert({
      userId: userId,
      resourceId: resourceId,
      isAssigned: true,
    });

    res.status(201).json(userResource);
  } catch (err) {
    res.status(400).json(err);
  }
};

module.exports = {
  createResource,
  getResources,
  getResource,
  deleteResource,
  updateResource,
  assignResource,
};
