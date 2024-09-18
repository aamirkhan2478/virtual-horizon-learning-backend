const Payment = require("../models/payment.model");
const Resources = require("../models/resources.model");
const User = require("../models/user.model");
const UserResource = require("../models/user_resources.model");
const stripe = require("../utils/stripe.utils");

// @route   POST /api/resource/create
// @desc    Create New Resource
// @access  Private
const createResource = async (req, res) => {
  // Get data from request body
  const { title, description, type, price } = req.body;

  // Get files from request
  const files = req.files;

  // Check if fields are not empty
  if (!title || !description || !type || !price) {
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
  let videos = "";
  const pdf = [];
  if (type === "Video") {
    if (files.videos) {
      files.videos.map((file) => {
        videos.length
          ? (videos += `,${basePath}${file.filename}`)
          : (videos += `${basePath}${file.filename}`);
      });
    }
  } else {
    if (files.pdf) {
      files.pdf.map((file) => pdf.push(`${basePath}${file.filename}`));
    }
  }

  try {
    // Create a new resource
    const resource = await Resources.query().insert({
      title: title,
      description: description,
      thumbnail: thumbnail[0],
      videos: videos.length ? videos : "",
      pdf: pdf.length ? pdf[0] : "",
      type: type,
      price: parseFloat(price),
    });

    // response the resource
    res.status(201).json(resource);
  } catch (err) {
    // response the error
    res.status(400).json({ error: err.message });
  }
};

// @route   GET /api/resource/all
// @desc    Show All Resources
// @access  Private
const getResources = async (_, res) => {
  try {
    // Show all resources
    const resources = await Resources.query();

    // Check if resources are not available
    if (!resources) {
      return res.status(404).json({ message: "Resources not found" });
    }

    // response the resources
    res.status(200).json(resources);
  } catch (err) {
    // response the error
    res.status(400).json({ error: err.message });
  }
};

// @route   GET /api/resource/:id/show
// @desc    Show Specific Resource
// @access  Private
const getResource = async (req, res) => {
  // Get id from request params
  const id = req.params.id;
  try {
    // Show the resource
    const resource = await Resources.query().findById(id);

    // Check if resource is not available
    if (!resource) {
      return res.status(404).json({ message: "Resource not found!" });
    }

    // show isAssigned and isBuyer
    const userResource = await UserResource.query()
      .where("resourceId", id)
      .andWhere("userId", req.user.id)
      .first();

    // Check if user resource isAssigned or not
    userResource
      ? (resource["isAssigned"] = userResource.isAssigned)
      : (resource["isAssigned"] = false);

    // Check if user resource isBuyer or not
    userResource
      ? (resource["isBuyer"] = userResource.isBuyer)
      : (resource["isBuyer"] = false);

    // Get assign teacher
    const assignTeacher = await User.query()
      .join("user_resources", "users.id", "user_resources.userId")
      .where("user_resources.resourceId", id)
      .andWhere("users.userType", "Teacher")
      .first();

    // Check if assign teacher is not available
    resource["assignTeacher"] = assignTeacher.name;

    // Check if assign teacher email is not available
    resource["assignTeacherEmail"] = assignTeacher.email;

    // response the resource
    res.status(200).json(resource);
  } catch (err) {
    // response the error
    res.status(400).json({ error: err.message });
  }
};

// @route   DELETE /api/resource/:id/delete
// @desc    Delete Specific Resource
// @access  Private
const deleteResource = async (req, res) => {
  // Get id from request params
  const id = req.params.id;
  try {
    // Delete the resource
    const resource = await Resources.query().deleteById(id);

    // Check if resource is not available
    if (!resource) {
      return res.status(404).json({ message: "Resource not found!" });
    }

    // response the message
    res.status(200).json({ message: "Resource deleted successfully!" });
  } catch (err) {
    // response the error
    res.status(400).json({ error: err.message });
  }
};

// @route   PUT /api/resource/:id/update
// @desc    Update The Resource
// @access  Private
const updateResource = async (req, res) => {
  // Get id from request params
  const id = req.params.id;

  // Get data from request body
  const { title, description, type, price } = req.body;

  // Get files from request
  const files = req.files;

  // Check if fields are not empty
  if (!title || !description || !type || !price) {
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
  const thumbnail = `${basePath}${files.thumbnail[0].filename}`;

  // Thumbnail is required
  if (!thumbnail) {
    return res
      .status(400)
      .json({ message: "Please select an image!", success: false });
  }

  // Check if video or pdf files are available
  const video = files.video
    ? files.video.map((file) => `${basePath}${file.filename}`)
    : "";
  const pdf = files.pdf
    ? files.pdf.map((file) => `${basePath}${file.filename}`)
    : "";

  try {
    // Update the resource
    const resource = await Resources.query()
      .findById(id)
      .patch({
        title: title,
        description: description,
        thumbnail: thumbnail[0],
        video: video,
        pdf: pdf[0],
        type: type,
        price: parseFloat(price),
      });

    // response the resource
    res.status(200).json(resource);
  } catch (err) {
    // response the error
    res.status(400).json({ error: err.message });
  }
};

// @route   POST /api/resource/assign
// @desc    Assign Resource By Teacher User
// @access  Private
const assignResource = async (req, res) => {
  // Get resourceId from request body
  const { resourceId } = req.body;

  // Check if fields are not empty
  if (!resourceId) {
    return res
      .status(400)
      .json({ message: "Please enter all fields!", success: false });
  }

  try {
    // Get user from database
    const user = await User.query().findById(req.user.id);

    // Check if user is not available
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Get resource from database
    const resource = await Resources.query().findById(resourceId);

    // Check if resource is not available
    if (!resource) {
      return res.status(404).json({ message: "Resource not found!" });
    }

    // if user is not teacher
    if (user.userType !== "Teacher") {
      return res.status(400).json({ message: "User is not a teacher!" });
    }

    // Get user resource from database
    const checkResource = await UserResource.query().where({
      userId: req.user.id,
      resourceId: resourceId,
    });

    // if teacher already assign resource
    if (checkResource.length) {
      return res.status(400).json({ message: "Resource already assigned!" });
    }

    // Assign the resource
    const userResource = await UserResource.query().insert({
      userId: req.user.id,
      resourceId: resourceId,
      isAssigned: true,
    });

    // response the user resource
    res.status(201).json(userResource);
  } catch (err) {
    // response the error
    res.status(400).json({ error: err.message });
  }
};

// @route   POST /api/resource/payment
// @desc    Payment Gateway
// @access  Private
const makePayment = async (req, res) => {
  // Get resourceId and amount from request body
  const { resourceId, amount } = req.body;

  try {
    // Create a new session
    const session = await stripe.checkout.sessions.create({
      // Payment Gateway
      payment_method_types: ["card"],
      // Line Items
      line_items: [
        {
          // Resource Name and Price in paisa (100 paisa = 1 rupee)
          price_data: {
            currency: "pkr",
            product_data: {
              name: `Resource ${resourceId}`,
              metadata: { userId: req.user.id, resource: resourceId },
            },
            unit_amount: amount * 100, // amount in paisa
          },
          quantity: 1,
        },
      ],

      // Metadata for the session
      metadata: { userId: req.user.id, resourceId: resourceId },

      // Success and Cancel URL
      mode: "payment",
      success_url: `${
        process.env.CLIENT_URL_PRODUCTION || process.env.CLIENT_URL_DEVELOPMENT
      }/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.CLIENT_URL_PRODUCTION || process.env.CLIENT_URL_DEVELOPMENT
      }/dashboard/cancel`,
    });

    // response the session
    res.status(200).json({ id: session.id, data: session });
  } catch (error) {
    // response the error
    res.status(500).send({ error: error.message });
  }
};

// @route   POST /api/resource/session/:id
// @desc    Payment Gateway
// @access  Private
const getSession = async (req, res) => {
  // Get id from request params
  const { id } = req.params;

  try {
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(id);

    // Store all the data in the database
    const payment = await Payment.query().insert({
      paymentIntentId: String(session.payment_intent),
      status: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      userId: Number(session.metadata.userId),
      resourceId: Number(session.metadata.resourceId),
    });

    // Check if payment is not available
    if (!payment) {
      return res.status(404).json({ message: "Payment not found!" });
    }

    // Get user resource from database
    const checkResource = await UserResource.query().where({
      userId: Number(session.metadata.userId),
      resourceId: Number(session.metadata.resourceId),
    });

    // if user already buy resource
    if (checkResource.length) {
      return res.status(400).json({ message: "Resource already bought!" });
    }

    // User Buy the resource
    const userResource = await UserResource.query().insert({
      userId: Number(session.metadata.userId),
      resourceId: Number(session.metadata.resourceId),
      isBuyer: true,
    });

    // Check if user resource is not available
    if (!userResource) {
      return res.status(404).json({ message: "User Resource not found!" });
    }

    // response the session
    res.status(200).json(session);
  } catch (error) {
    // response the error
    res.status(500).send({ error: error.message });
  }
};

// @route   POST /api/resource/user-resources
// @desc    Show User Resources
// @access  Private
const getUserResources = async (req, res) => {
  try {
    /* 
      Get user resources from database 
      using join query with user_resources 
      table and resources table using userId 
      and resourceId as foreign key
    */
    const resources = await Resources.query()
      .join("user_resources", "resources.id", "user_resources.resourceId")
      .where("user_resources.userId", req.user.id);

    // response the resources
    res.status(200).json(resources);
  } catch (err) {
    // response the error
    res.status(400).json({ error: { error: err.message } });
  }
};

module.exports = {
  createResource,
  getResources,
  getResource,
  deleteResource,
  updateResource,
  assignResource,
  makePayment,
  getSession,
  getUserResources,
};
