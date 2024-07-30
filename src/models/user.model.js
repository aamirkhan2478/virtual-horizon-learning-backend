const { Model } = require("objection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class User extends Model {
  static get tableName() {
    return "users";
  }

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

  async $beforeInsert() {
    await this.hashPassword();
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  generateAccessToken() {
    return jwt.sign({ id: this.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    });
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

module.exports = User;
