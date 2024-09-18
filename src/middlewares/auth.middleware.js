const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const verifyToken = (token) => {
  // Check if token is provided
  if (!token) {
    throw new Error("No token provided", 401);
  }

  try {
    // Verify token
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    // Throw error if token is invalid
    throw new Error("Invalid token", 401);
  }
};

const findUser = async (id) => {
  // Find user by id
  const user = await User.query()
    .findById(id)
    .select("id", "name", "email", "userType");

  // Check if user exists
  if (!user) {
    throw new Error("Invalid access token", 401);
  }

  // Return user
  return user;
};

const auth = async (req, res, next) => {
  try {
    //  Get token from authorization header
    const bearerToken = req.headers.authorization;

    // Check if token is provided
    const token = bearerToken.split(" ")[1];

    //  Verify token
    const decoded = verifyToken(token);

    // Find user by id
    req.user = await findUser(decoded.id);

    // Proceed to next middleware
    next();
  } catch (error) {
    // Return error response
    return res.status(401).json({
      message: "Not authorized to access this route",
      success: false,
    });
  }
};

// Export middleware
module.exports = auth;
