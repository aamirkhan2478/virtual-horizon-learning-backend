const { Model } = require("objection");

class QuizQuestion extends Model {
  static get tableName() {
    return "quiz_questions";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["quiz_id", "question_id"],

      properties: {
        id: { type: "integer" },
        quiz_id: { type: "integer" },
        question_id: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const Quiz = require("./quiz.model");
    const Question = require("./questions.model");

    return {
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: "quiz_questions.quiz_id",
          to: "quizzes.id",
        },
      },
      question: {
        relation: Model.BelongsToOneRelation,
        modelClass: Question,
        join: {
          from: "quiz_questions.question_id",
          to: "questions.id",
        },
      },
    };
  }
}

module.exports = QuizQuestion;
