import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const TaskSchema = new Schema(
  {
    // Creator user id (mandatory)
    creator: {
      type: Types.ObjectId,
      required: true,
      ref: "Profile"
    },
    // Assignees stored as an array of numbers (ensure transformation from CSV array strings)
    assignee: {
      type: [Types.ObjectId],
      required: true,
      ref: "Profile"
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    academicYear: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    // Notification flags
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    pushNotification: { type: Boolean, default: false },
    // Type: 'T' for Task, 'N' for Note – enforce enum for data integrity
    type: { type: String, enum: ["T", "N"], required: true },
    status: { type: String },
    // Dates should be converted from "DD-MM-YYYY" to valid Date objects
    targetDate: { type: Date },
    completedDate: { type: Date },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
