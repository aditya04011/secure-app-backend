import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    permissions: {
      type: Map,
      of: {
        type: Map,
        of: { type: Boolean, default: false }
      },
      default: new Map()
    },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;
