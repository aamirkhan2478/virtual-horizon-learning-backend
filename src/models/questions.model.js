const { Model } = require("objection");

class Questions extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "questions";
  }

  // This object defines the relations to other models.
  static get jsonSchema() {
    return {
      type: "object",
      required: ["question", "options", "correctAnswer"],
      properties: {
        id: { type: "integer" },
        question: { type: "string" },
        options: { type: "string" },
        correctAnswer: { type: "string" },
      },
    };
  }
}

module.exports = Questions;
