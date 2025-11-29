import mongoose from "mongoose";

const { Schema } = mongoose;

// service schema
const ServiceSchema = new Schema(
  {
    enable: { type: Boolean, default: false },
  },
  { _id: false }
);

// module schema (holds services)
const ModuleSchema = new Schema(
  {
    services: {
      type: Map,
      of: ServiceSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

// main schema
const NotificationSchema = new Schema(
  {
    serviceName: { type: String, required: true },
    permissions: {
      type: Map,         // dynamic modules (admissions, schedules, etc.)
      of: ModuleSchema,  // each module follows ModuleSchema
      default: () => ({}),
    },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
