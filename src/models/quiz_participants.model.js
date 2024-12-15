const { Model } = require("objection");

class QuizParticipant extends Model {
  static get tableName() {
    return "quiz_participants";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["quiz_id", "score"],

      properties: {
        id: { type: "integer" },
        quiz_id: { type: "integer" },
        participant_id: { type: "integer" },
        score: { type: "integer" },
        completed: { type: "boolean" },
      },
    };
  }

  static get relationMappings() {
    const Quiz = require("./quiz.model");
    const User = require("./user.model");

    return {
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: "quiz_participants.quiz_id",
          to: "quizzes.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "quiz_participants.participant_id",
          to: "users.id",
        },
      },
    };
  }
}

module.exports = QuizParticipant;
