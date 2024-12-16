const { Model } = require("objection");

class Assignment extends Model {
  static get tableName() {
    return "assignments";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["description", "resource_id", "added_by", "total_marks"],

      properties: {
        id: { type: "integer" },
        resource_id: { type: "integer" },
        description: { type: "string", minLength: 1, maxLength: 255 },
        added_by: { type: "integer" },
        total_marks: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const Resource = require("./resources.model");
    const User = require("./user.model");

    return {
      resource: {
        relation: Model.BelongsToOneRelation,
        modelClass: Resource,
        join: {
          from: "assignments.resource_id",
          to: "resources.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "assignments.added_by",
          to: "users.id",
        },
      },
    };
  }
}

module.exports = Assignment;
