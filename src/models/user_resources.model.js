const { Model } = require("objection");

class UserResource extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "user_resources";
  }

  // This object defines the relations to other models.
  static get idColumn() {
    return "id";
  }

  // This object defines the relations to other models.
  static get jsonSchema() {
    return {
      type: "object",
      required: ["userId", "resourceId"],

      properties: {
        id: { type: "integer" },
        userId: { type: "integer" },
        resourceId: { type: "integer" },
        isAssigned: { type: "boolean", default: false },
        isBuyer: { type: "boolean", default: false },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    const User = require("./user.model");
    const Resource = require("./resources.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_resources.userId",
          to: "users.id",
        },
      },
      resource: {
        relation: Model.BelongsToOneRelation,
        modelClass: Resource,
        join: {
          from: "user_resources.resourceId",
          to: "resources.id",
        },
      },
    };
  }
}

module.exports = UserResource;
