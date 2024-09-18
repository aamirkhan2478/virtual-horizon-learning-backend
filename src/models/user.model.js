const { Model } = require("objection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class User extends Model {
  // Table name is the only required property.
  static get tableName() {
    return "users";
  }

  // This object defines the relations to other models.
  static get jsonSchema() {
    return {
      type: "object",
      required: ["name", "password", "email", "userType", "phoneNumber"],
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        pic: {
          type: "string",
          default:
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        },
        password: { type: "string" },
        email: { type: "string" },
        userType: {
          type: "string",
          enum: ["Admin", "Student", "Teacher", "Parent"],
        },
        isVerified: { type: "boolean", default: false },
        phoneNumber: { type: "string" },
        forgotPasswordToken: { type: "string", nullable: true },
        forgotPasswordTokenExpiry: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
        verifyToken: { type: "string", nullable: true },
        verifyTokenExpiry: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
      },
    };
  }

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      resources: {
        relation: Model.ManyToManyRelation,
        modelClass: require("./resources.model"),
        join: {
          from: "users.id",
          through: {
            from: "user_resources.userId",
            to: "user_resources.resourceId",
          },
          to: "resources.id",
        },
      },
      payments: {
        relation: Model.HasManyRelation,
        modelClass: require("./payment.model"),
        join: {
          from: "users.id",
          to: "payments.userId",
        },
      },
    };
  }

  // This object defines the relations to other models.
  async $beforeInsert() {
    await this.hashPassword();
  }

  // This object defines the relations to other models.
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // This object defines the relations to other models.
  generateAccessToken() {
    return jwt.sign({ id: this.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    });
  }

  // This object defines the relations to other models.
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

module.exports = User;
