const Resources = require("../models/resources.model");
const User = require("../models/user.model");
const UserResource = require("../models/user_resources.model");

const counts = async (req, res) => {
  try {
    const { userId } = req.body;

    // Get total number of purchased resources
    const purchasedResources = await UserResource.query()
      .skipUndefined()
      .count("id as count")
      .where({
        userId,
        isBuyer: true,
      })
      .first();

    // Get total number of Assigned Resources
    const assignedResources = await UserResource.query()
      .skipUndefined()
      .count("id as count")
      .where({
        userId,
        isAssigned: true,
      })
      .first();

    // Get total number of resources
    const totalResources = await Resources.query().count("id as count").first();

    // Get total number of Students
    const totalStudents = await User.query()
      .skipUndefined()
      .count("id as count")
      .where("userType", "Student")
      .first();

    // Get total number of Teachers
    const totalTeachers = await User.query()
      .skipUndefined()
      .count("id as count")
      .where("userType", "Teacher")
      .first();

    if (userId) {
      return res.status(200).json({
        purchasedResources: purchasedResources.count || 0,
        assignedResources: assignedResources.count || 0,
        totalResources: totalResources.count || 0,
        totalStudents: totalStudents.count || 0,
        totalTeachers: totalTeachers.count || 0,
      });
    } else {
      return res.status(200).json({
        totalResources: totalResources.count || 0,
        totalStudents: totalStudents.count || 0,
        totalTeachers: totalTeachers.count || 0,
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  counts,
};
