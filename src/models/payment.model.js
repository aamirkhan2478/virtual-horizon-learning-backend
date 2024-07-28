const { Model } = require("objection");

class Payment extends Model {
  static get tableName() {
    return "payments";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["userId", "resourceId", "amount", "currency", "status"],
      properties: {
        id: { type: "integer" },
        userId: { type: "integer" },
        resourceId: { type: "integer" },
        amount: { type: "number" },
        currency: { type: "string", default: "pkr" },
        status: { type: "string" },
        paymentIntentId: { type: "string" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./user.model");
    const Resource = require("./resources.model");

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "payments.userId",
          to: "users.id",
        },
      },
      resource: {
        relation: Model.BelongsToOneRelation,
        modelClass: Resource,
        join: {
          from: "payments.resourceId",
          to: "resources.id",
        },
      },
    };
  }
}

module.exports = Payment;
