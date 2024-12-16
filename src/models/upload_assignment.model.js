const { Model } = require("objection");

class UploadAssignment extends Model {
  static get tableName() {
    return "upload_assignments";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["assignment_id", "uploaded_by", "file_path"],

      properties: {
        id: { type: "integer" },
        assignment_id: { type: "integer" },
        uploaded_by: { type: "integer" },
        file_path: { type: "string", minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings() {
    const Assignment = require("./assignment.model");
    const User = require("./user.model");

    return {
      assignment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Assignment,
        join: {
          from: "upload_assignments.assignment_id",
          to: "assignments.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "upload_assignments.uploaded_by",
          to: "users.id",
        },
      },
    };
  }
}

module.exports = UploadAssignment;
