// noteTask.model.js
import mongoose from "mongoose";

const noteTaskSchema = new mongoose.Schema(
  {
     referenceId: { type: mongoose.Schema.Types.ObjectId },
    creator: { type: String, required: true },
    description: { type: String, required: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    type: { type: String, required: true },
    status: { type: String },
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

const NoteTask = mongoose.model("NoteTask", noteTaskSchema);
export default NoteTask;
