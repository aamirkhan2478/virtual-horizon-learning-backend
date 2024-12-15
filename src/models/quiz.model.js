const { Model } = require("objection");
const User = require("./user.model");

class Quiz extends Model {
  static get tableName() {
    return "quizzes";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["resource_id", "added_by"],

      properties: {
        id: { type: "integer" },
        resource_id: { type: "integer" },
        added_by: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const Resources = require("./resources.model");
    const Questions = require("./questions.model");

    return {
      resources: {
        relation: Model.BelongsToOneRelation,
        modelClass: Resources,
        join: {
          from: "quizzes.resource_id",
          to: "resources.id",
        },
      },
      questions: {
        relation: Model.ManyToManyRelation,
        modelClass: Questions,
        join: {
          from: "quizzes.id",
          through: {
            from: "quiz_questions.quiz_id",
            to: "quiz_questions.question_id",
          },
          to: "questions.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "quizzes.added_by",
          to: "users.id",
        },
      },
    };
  }
}

module.exports = Quiz;
