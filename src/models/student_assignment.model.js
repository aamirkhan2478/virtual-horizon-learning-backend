const { Model } = require("objection");

class StudentAssignment extends Model {
  static get tableName() {
    return "student_assignments";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["submitted_by", "assignment_id", "score"],

      properties: {
        id: { type: "integer" },
        submitted_by: { type: "integer" },
        assignment_id: { type: "integer" },
        score: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./user.model");
    const Assignment = require("./assignment.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "student_assignments.submitted_by",
          to: "users.id",
        },
      },
      assignment: {
        relation: Model.BelongsToOneRelation,
        modelClass: Assignment,
        join: {
          from: "student_assignments.assignment_id",
          to: "assignments.id",
        },
      },
    };
  }
}


module.exports = StudentAssignment;