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
        video: { type: "array", items: { type: "string" } },
        pdf: { type: "string" },
      },
    };
  }
}

module.exports = Resources;
