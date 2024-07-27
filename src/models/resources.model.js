const { Model } = require("objection");

class Resources extends Model {
  static get tableName() {
    return "resources";
  }

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
        videos: { type: "array", items: { type: "string" } },
        pdf: { type: "string" },
        price: { type: "number" },
      },
    };
  }

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
    };
  }
}

module.exports = Resources;
