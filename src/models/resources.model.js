const { Model } = require("objection");

class Resources extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "resources";
  }

  // This object defines the relations to other models.
  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "description", "thumbnail", "type"],
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
        description: { type: "string" },
        thumbnail: { type: "string" },
        type: {
          type: "string",
          enum: ["Video", "PDF"],
        },
        videos: { type: "string" },
        pdf: { type: "string" },
        price: { type: "number" },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: require("./user.model"),
        join: {
          from: "resources.id",
          through: {
            from: "user_resources.resourceId",
            to: "user_resources.userId",
          },
          to: "users.id",
        },
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: require("./payment.model"),
        join: {
          from: "resources.id",
          to: "payments.resourceId",
        },
      },
    };
  }
}

module.exports = Resources;
