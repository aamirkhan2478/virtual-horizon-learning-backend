const Payment = require("../models/payment.model");
const Resources = require("../models/resources.model");
const User = require("../models/user.model");
const UserResource = require("../models/user_resources.model");
const Questions = require("../models/questions.model");
const Quiz = require("../models/quiz.model");
const QuizQuestion = require("../models/quiz_questions.model");
const stripe = require("../utils/stripe.utils");
const geminiResponse = require("../utils/gemini_setup.utils");

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
      .json({ message: "Please select a file!", success: false });
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

    // Create quiz questions using an AI prompt
    // const prompt = `Make quiz on ${title} with 10 questions and 4 options each. Each question should have one correct answer in the form of json. the format of json should be like this: {"question": "What is the capital of Pakistan?", "options": ["Islamabad", "Karachi", "Lahore", "Quetta"], "correctAnswer": "Islamabad"}`;

    // const questions = await geminiResponse(prompt);

    // const questionIds = [];

    // for (let i = 0; i < questions.length; i++) {
    //   const question = questions[i];
    //   // Convert options array to comma-separated string
    //   question.options = question.options.join(",");

    //   // Insert each question into the Questions table
    //   const insertedQuestion = await Questions.query().insert({
    //     question: question.question,
    //     options: question.options,
    //     correctAnswer: question.correctAnswer,
    //   });

    //   // Collect the inserted question ID
    //   questionIds.push(insertedQuestion.id);
    // }

    // // 3. Create a new quiz associated with the resource
    // const quiz = await Quiz.query().insert({
    //   resource_id: resource.id,
    //   completed: false,
    // });

    // // 4. Associate the quiz with the questions
    // if (questionIds.length === 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "No questions were created", success: false });
    // }

    // for (let i = 0; i < questionIds.length; i++) {
    //   const questionId = questionIds[i];

    //   if (!questionId) {
    //     return res
    //       .status(400)
    //       .json({ message: "Invalid question ID", success: false });
    //   }

    //   // Associate the quiz with the questions
    //   await QuizQuestion.query().insert({
    //     quiz_id: quiz.id,
    //     question_id: questionId,
    //   });
    // }

    // Response the resource
    return res.status(201).json({
      resource,
      message: "Resource created successfully!",
    });
  } catch (err) {
    console.log(err);

    // Handle any errors that occur
    return res.status(400).json({ error: err.message });
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
    return res.status(200).json(resources);
  } catch (err) {
    // response the error
    return res.status(400).json({ error: err.message });
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
    if (!assignTeacher) {
      resource["assignTeacher"] = "";
      resource["assignTeacherEmail"] = "";
      resource["assignTeacherPic"] = "";
    } else {
      resource["assignTeacher"] = assignTeacher.name;
      resource["assignTeacherEmail"] = assignTeacher.email;
      resource["assignTeacherPic"] = assignTeacher.pic;
    }

    // response the resource
    return res.status(200).json(resource);
  } catch (err) {
    console.log(err);

    // response the error
    return res.status(400).json({ error: err.message });
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
    return res.status(200).json({ message: "Resource deleted successfully!" });
  } catch (err) {
    // response the error
    return res.status(400).json({ error: err.message });
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
    return res.status(200).json(resource);
  } catch (err) {
    // response the error
    return res.status(400).json({ error: err.message });
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
    return res.status(201).json(userResource);
  } catch (err) {
    // response the error
    return res.status(400).json({ error: err.message });
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
    return res.status(200).json({ id: session.id, data: session });
  } catch (error) {
    // response the error
    return res.status(500).send({ error: error.message });
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
    return res.status(200).json(session);
  } catch (error) {
    // response the error
    return res.status(500).send({ error: error.message });
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
    return res.status(200).json(resources);
  } catch (err) {
    // response the error
    return res.status(400).json({ error: { error: err.message } });
  }
};

// @route   GET /api/resource/latest
// @desc    Show Latest 6 Resources
// @access  Public
const getLatestResources = async (_, res) => {
  try {
    // Show latest 6 resources
    const resources = await Resources.query().limit(6).orderBy("id", "desc");

    // Check if resources are not available
    if (!resources || resources.length === 0) {
      return res.status(404).json({ message: "Resources not found" });
    }

    // Show teacher name, email and pic in response
    const resourcesData = [];

    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];

      // Get user resource only isAssign true
      const userResource = await UserResource.query()
        .where("resourceId", resource.id)
        .andWhere("isAssigned", true)
        .first();

      if (!userResource) {
        continue;
      }

      const user = await User.query().findById(userResource.userId);

      // Check if user exists
      if (user) {
        resource["teacherName"] = user.name;
        resource["teacherEmail"] = user.email;
        resource["teacherPic"] = user.pic;
      }

      resourcesData.push(resource);
    }

    // Respond with the resources data
    return res.status(200).json(resourcesData);
  } catch (err) {
    // Respond with the error
    return res.status(400).json({ error: err.message });
  }
};

// @route   GET /api/resource/quizzes
// @desc    Show Quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    // Fetch quizzes along with the related questions
    const quizzes = await Quiz.query().withGraphFetched("questions");

    // Format the response to include the questions with separated options array
    const formattedQuizzes = quizzes.map(async (quiz) => {
      const resource = await Resources.query().findById(quiz.resource_id);

      console.log(resource);

      return {
        id: quiz.id,
        title: resource.title,
        completed: quiz.completed,
        questions: quiz.questions.map((question) => ({
          id: question.id,
          question: question.question,
          options: question.options.split(","), // Split options string into an array
          correctAnswer: question.correctAnswer,
        })),
      };
    });

    const formattedQuizzesData = await Promise.all(formattedQuizzes);

    // Respond with the formatted quizzes
    return res.status(200).json(formattedQuizzesData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// @route   POST /api/resource/generate-quiz
// @desc    Generate Quiz
// @access  Private
const generateQuiz = async (req, res) => {
  const { userPrompt } = req.body;

  try {
    // Create quiz questions using an AI prompt
    const prompt = `${userPrompt} in the form of json. The format of json should be like this: {"question": "What is the capital of Pakistan?", "options": ["Islamabad", "Karachi", "Lahore", "Quetta"], "correctAnswer": "Islamabad"}`;

    const questions = await geminiResponse(prompt);

    // Response with the created questions
    return res.status(200).json({
      questions,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/resource/save-quiz
// @desc    Save Quiz
// @access  Private
const saveQuiz = async (req, res) => {
  const { resource_id, questions, marks } = req.body;

  try {
    // Create a new quiz associated with the resource
    const quiz = await Quiz.query().insert({
      resource_id,
      completed: false,
      added_by: req.user.id,
      total_marks: marks,
    });

    // Associate the quiz with the questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Insert each question into the Questions table
      const insertedQuestion = await Questions.query().insert({
        question: question.question,
        options: question.options.join(","),
        correctAnswer: question.correctAnswer,
      });

      // Associate the quiz with the questions
      await QuizQuestion.query().insert({
        quiz_id: quiz.id,
        question_id: insertedQuestion.id,
      });
    }

    // Respond with the quiz
    return res.status(201).json({
      quiz,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
  getLatestResources,
  getQuizzes,
  generateQuiz,
  saveQuiz,
};
