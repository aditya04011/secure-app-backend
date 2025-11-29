import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const BranchRoleSchema = new Schema({
  branchId: { type: Types.ObjectId, required: true, ref: "Branch"},
  // branchName: { type: String, required: true },
  roleId: { type: Types.ObjectId, required: true, ref: "Role" }
});

const UserSchema = new Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Leverage a nested subdocument to capture multi-branch role associations.
    roles: { type: [BranchRoleSchema], required: true },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
    passwordChangedAt: { type: Date, default: Date.now },
    tokenVersion: { type: Number, default: 1 }
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  if (this.tokenVersion >= 20) {
    this.tokenVersion = 1;
  }
  next();
});

export default mongoose.model("User", UserSchema);
