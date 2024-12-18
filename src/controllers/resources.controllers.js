const Payment = require("../models/payment.model");
const Resources = require("../models/resources.model");
const User = require("../models/user.model");
const UserResource = require("../models/user_resources.model");
const Questions = require("../models/questions.model");
const Quiz = require("../models/quiz.model");
const QuizQuestion = require("../models/quiz_questions.model");
const stripe = require("../utils/stripe.utils");
const geminiResponse = require("../utils/gemini_setup.utils");
// const Assignment = require("../models/assignment.model");
const QuizParticipant = require("../models/quiz_participants.model");
const Assignment = require("../models/assignment.model");
const UploadAssignment = require("../models/upload_assignment.model");
const StudentAssignment = require("../models/student_assignment.model");

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
  const { resource_id, questions } = req.body;

  try {
    // Create a new quiz associated with the resource
    const quiz = await Quiz.query().insert({
      resource_id,
      added_by: req.user.id,
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
      message: "Quiz created successfully!",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/resource/quizzes
// @desc    Get Quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  const { resourceId } = req.query;

  try {
    // Fetch quizzes along with the related questions
    const quizzes = await Quiz.query()
      .withGraphFetched("questions")
      .where("resource_id", resourceId);

    // Filter out quizzes where the length of questions is zero
    const filteredQuizzes = quizzes.filter((quiz) => quiz.questions.length > 0);

    // Format the response to include the questions with separated options array
    const formattedQuizzes = filteredQuizzes.map(async (quiz) => {
      // const quizParticipant = await QuizParticipant.query().findById(quiz.id);
      const quizParticipant = await QuizParticipant.query().findOne({
        quiz_id: quiz.id,
      });

      return {
        id: quiz.id,
        completed: quizParticipant ? quizParticipant.completed : false,
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
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

// @route   Patch /api/resource/update-quiz
// @desc    Update Quiz
// @access  Private
const updateQuiz = async (req, res) => {
  const { quizId, obtainedMarks, completed } = req.body;

  try {
    // Update the quiz with the obtained marks and completion status
    const quiz = await QuizParticipant.query().insert({
      quiz_id: quizId,
      participant_id: req.user.id,
      score: obtainedMarks,
      completed,
    });

    // Respond with the updated quiz
    return res
      .status(200)
      .json({ quiz, message: "Quiz updated successfully!" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

// @route   Patch /api/resource/save-assignment
// @desc    Save Assignment
// @access  Private
const saveAssignment = async (req, res) => {
  // Upload the assignment to the server

  // Get the resource ID and user ID from the request body
  const { description, resourceId, marks } = {
    ...req.body,
    resourceId: parseInt(req.body.resourceId, 10),
    marks: parseInt(req.body.marks, 10),
  };

  const file = req.file;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  // Check if the file is not available
  if (!file) {
    return res.status(400).json({ message: "Please select a file!" });
  }

  // Get the file path
  const filePath = `${basePath}${file.filename}`;

  try {
    // Save the assignment to the database
    const assignmentData = await Assignment.query().insert({
      resource_id: resourceId,
      added_by: req.user.id,
      description,
      total_marks: marks,
    });

    // Upload the assignment to the server
    const uploadAssignmentData = await UploadAssignment.query().insert({
      assignment_id: assignmentData.id, // Fixed: Use `assignmentData.id`
      uploaded_by: req.user.id,
      file_path: filePath,
    });

    const assignment = {
      ...assignmentData,
      file: uploadAssignmentData.file_path,
    };

    // Respond with the assignment
    return res
      .status(201)
      .json({ assignment, message: "Assignment saved successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/resource/assignments
// @desc    Get Assignments for a specific resource
// @access  Private
const getAssignments = async (req, res) => {
  const { resourceId } = req.query; // Extract resourceId from query params

  try {
    // Validate that resourceId is provided
    if (!resourceId) {
      return res.status(400).json({ message: "Resource ID is required" });
    }

    // Fetch assignments for the specified resource, join with upload_assignments and student_assignments
    const assignments = await Assignment.query()
      .select(
        "assignments.id",
        "assignments.description",
        "assignments.total_marks",
        "assignments.added_by",
        "upload_assignments.file_path",
        "student_assignments.is_submitted"
      )
      .leftJoin(
        "upload_assignments",
        "assignments.id",
        "upload_assignments.assignment_id"
      )
      .leftJoin(
        "student_assignments",
        "assignments.id",
        "student_assignments.assignment_id"
      )
      .where("assignments.resource_id", resourceId);

    // Check if no assignments are found
    if (!assignments.length) {
      return res
        .status(404)
        .json({ message: "No assignments found for this resource" });
    }

    // Format the response to include is_submitted and file path
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      description: assignment.description,
      totalMarks: assignment.total_marks,
      addedBy: assignment.added_by,
      uploadedFilePath: assignment.file_path || null,
      isSubmitted: !!assignment.is_submitted, // Ensure boolean value
    }));

    // Respond with the formatted assignments
    return res.status(200).json(formattedAssignments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// @route   GET /api/resource/submitted-assignments
// @desc    Get Submitted Assignments for a specific resource
// @access  Private
const getSubmittedAssignments = async (req, res) => {
  const { resourceId } = req.query; // Extract resourceId from query params

  try {
    // Validate that resourceId is provided
    if (!resourceId) {
      return res.status(400).json({ message: "Resource ID is required" });
    }

    // Query submitted assignments with related assignment and student details
    const submittedAssignments = await StudentAssignment.query()
      .select(
        "student_assignments.id as submissionId",
        "student_assignments.is_submitted",
        "student_assignments.score",
        "student_assignments.submitted_by as studentId",
        "assignments.description as assignmentDescription",
        "assignments.total_marks as totalMarks",
        "upload_assignments.file_path as submittedFilePath",
        "users.name as studentName"
      )
      .join(
        "assignments",
        "student_assignments.assignment_id",
        "assignments.id"
      )
      .join(
        "upload_assignments",
        "assignments.id",
        "upload_assignments.assignment_id"
      )
      .join("users", "student_assignments.submitted_by", "users.id")
      .where("assignments.resource_id", resourceId)
      .andWhere("student_assignments.is_submitted", true); // Only fetch submitted ones

    // Check if there are no submissions
    if (!submittedAssignments.length) {
      return res.status(404).json({
        message: "No submitted assignments found for this resource.",
      });
    }

    // Format response
    const formattedSubmissions = submittedAssignments.map((submission) => ({
      submissionId: submission.submissionId,
      studentId: submission.studentId,
      studentName: submission.studentName,
      assignmentDescription: submission.assignmentDescription,
      totalMarks: submission.totalMarks,
      score: submission.score,
      submittedFilePath: submission.submittedFilePath,
    }));

    // Respond with formatted submissions
    return res.status(200).json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching submitted assignments:", error.message);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// @route   Patch /api/resource/submit-assignment
// @desc    Submit Assignment
// @access  Private
const submitAssignment = async (req, res) => {
  try {
    // Upload the assignment to the server
    const file = req.file;

    // Parse resource ID and validate the request body
    const { resourceId } = {
      ...req.body,
      resourceId: parseInt(req.body.resourceId, 10),
    };

    // Base path for uploaded files
    const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

    // Check if a file was uploaded
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please select a file to upload!" });
    }

    // Validate resourceId
    if (!resourceId || isNaN(resourceId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing resource ID!" });
    }

    // Get the file path
    const filePath = `${basePath}${file.filename}`;

    // Verify that the resourceId exists in the assignments table
    const existingAssignment = await Assignment.query().findById(resourceId);

    if (!existingAssignment) {
      return res.status(404).json({
        message: "Assignment not found. Please provide a valid assignment ID.",
      });
    }

    // Save the student's assignment submission
    const studentAssignment = await StudentAssignment.query().insert({
      submitted_by: req.user.id,
      assignment_id: resourceId,
      score: 0, // Default score
      is_submitted: true, // Set the flag to true
    });

    // Upload the assignment file
    const uploadAssignmentData = await UploadAssignment.query().insert({
      assignment_id: resourceId,
      uploaded_by: req.user.id,
      file_path: filePath,
    });

    // Prepare the final assignment response
    const assignmentResponse = {
      id: studentAssignment.id,
      submitted_by: studentAssignment.submitted_by,
      assignment_id: studentAssignment.assignment_id,
      score: studentAssignment.score,
      file: uploadAssignmentData.file_path,
    };

    // Respond with success
    return res.status(201).json({
      assignment: assignmentResponse,
      message: "Assignment submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting assignment:", error.message);

    return res.status(500).json({
      error: "Something went wrong while submitting the assignment.",
      details: error.message,
    });
  }
};

// @route   Patch /api/resource/update-assignment
// @desc    Update Assignment
// @access  Private
const updateAssignment = async (req, res) => {
  // Get the assignment ID from the request body
  const { assignmentId, score, submittedBy } = req.body;

  try {
    // Update the assignment with the obtained marks by student id
    const assignment = await StudentAssignment.query()
      .where("submitted_by", submittedBy)
      .findById(assignmentId)
      .patch({ score });

    // Respond with the updated assignment
    return res
      .status(200)
      .json({ assignment, message: "Assignment updated successfully!" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
};

// @route   GET /api/resource/scores
// @desc    Get Scores (Quiz & Assignments) for a specific resource
// @access  Private
const getScores = async (req, res) => {
  const { resourceId, studentId } = req.query; // Extract resourceId and optionally studentId from query params
  const userType = req.user.userType; // Assume userType is extracted from auth middleware

  try {
    // Validate that resourceId is provided
    if (!resourceId) {
      return res.status(400).json({ message: "Resource ID is required" });
    }

    // Base query for quiz scores
    const quizQuery = QuizParticipant.query()
      .select(
        "quiz_participants.participant_id",
        "users.name as student_name",
        "quiz_participants.score",
        "quiz_participants.completed"
      )
      .leftJoin("users", "quiz_participants.participant_id", "users.id")
      .leftJoin("quizzes", "quiz_participants.quiz_id", "quizzes.id")
      .where("quizzes.resource_id", resourceId);

    // Base query for assignment scores
    const assignmentQuery = StudentAssignment.query()
      .select(
        "student_assignments.submitted_by",
        "users.name as student_name",
        "student_assignments.score",
        "assignments.total_marks",
        "student_assignments.is_submitted"
      )
      .leftJoin("users", "student_assignments.submitted_by", "users.id")
      .leftJoin(
        "assignments",
        "student_assignments.assignment_id",
        "assignments.id"
      )
      .where("assignments.resource_id", resourceId);

    // If studentId is provided (specific student), filter both queries
    if (studentId) {
      quizQuery.andWhere("quiz_participants.participant_id", studentId);
      assignmentQuery.andWhere("student_assignments.submitted_by", studentId);
    }

    // Execute both queries
    const [quizScores, assignmentScores] = await Promise.all([
      quizQuery,
      assignmentQuery,
    ]);

    // Combine quiz and assignment scores
    const combinedScores = [
      ...quizScores.map((quiz) => ({
        studentId: quiz.student_id,
        studentName: quiz.student_name,
        obtainedMarks: quiz.score,
        status: quiz.completed ? "Completed" : "Not Completed",
        type: "Quiz",
      })),
      ...assignmentScores.map((assignment) => ({
        studentId: assignment.student_id,
        studentName: assignment.student_name,
        obtainedMarks: assignment.score,
        status: assignment.is_submitted ? "Completed" : "Not Completed",
        type: "Assignment",
      })),
    ];

    // Check if no scores are found
    if (!combinedScores.length) {
      return res
        .status(404)
        .json({ message: "No scores found for this resource" });
    }

    // Respond with scores (filtered for specific student if applicable)
    return res.status(200).json(combinedScores);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal Server Error" });
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
  updateQuiz,
  saveAssignment,
  getAssignments,
  getSubmittedAssignments,
  submitAssignment,
  updateAssignment,
  getScores,
};
