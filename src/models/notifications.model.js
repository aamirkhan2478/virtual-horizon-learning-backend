// models/Notification.js
const { Model } = require("objection");

class Notification extends Model {
  static get tableName() {
    return "notifications";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "message"],

      properties: {
        id: { type: "integer" },
        teacher_email: { type: "string", minLength: 1, maxLength: 255 },
        student_email: { type: "string", minLength: 1, maxLength: 255 },
        title: { type: "string", minLength: 1, maxLength: 255 },
        message: { type: "string", minLength: 1, maxLength: 1000 },
        read: { type: "boolean", default: false },
        status: {
          type: "string",
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        course_title: { type: "string", minLength: 1, maxLength: 255 },
      },
    };
  }
}

module.exports = Notification;
