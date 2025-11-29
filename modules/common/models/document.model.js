import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const DocumentSchema = new Schema(
  {
    // Creator can be referenced as an ObjectId if linked to a User collection.
    // Here, since CSV provides a string (e.g., "ravee"), it's stored as a string.
    // If you need to reference a User document, update the type to Types.ObjectId and add ref: 'User'.
    creator: { type: Types.ObjectId, ref: "User"},
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    type: { type: String, required: true },
    mimeType: { type: String, required: true },
    // Version field for schema versioning
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema);
