import mongoose from "mongoose";
const { Schema } = mongoose;

const ProfileSchema = new Schema(
  {
    /* These are all base object properties */
    type: {
      type: String,
      enum: [
        "superadmin",
        "owner",
        "accountant",
        "manager",
        "admin",
        "owner",
        "parent",
        "student",
        "guardian",
        "faculty",
        "staff",
        "receptionist",
        "others",
      ],
      required: true,
    },
    /*
    While creating profile of any type we must have user created prior to it.
    So, we can use userId to reference the user who created the profile.
    */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    // "studentId" can be an array referencing profiles in the same collection (if applicable)
    relationId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
    /*
    For relation we must add strict dropdown with minimal options 
    */
    gender: { type: String },
    relation: [{type: String }],
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String },
    doB: { type: Date },
    // Storing Aadhar number as a string for precision
    aadharNumber: { type: String },
    primaryNumber: { type: String, required: true },
    secondaryNumber: { type: String },
    primaryEmail: { type: String, required: true },
    secondaryEmail: { type: String },
    occupation: { type: String },
    presentAddress: { type: Map },
    pincode: { type: Number },
    permanentAddress: { type: Map },
    // "location" stored as an array of strings, e.g., ["14.52N", "56.231E"]
    location: [{ type: String }],
    // "documentId" represents references (photo/resume) as an array of numbers
    documentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    highestQualification: { type: String },
    // "skills" is a flexible field—accepting JSON arrays or other mixed types
    skills: { type: Schema.Types.Mixed },
    // "referenceId" points to the job recommendation profile (if any)
    referenceId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    /* relation property must be fulltime for monthly payout */
    salary: { type: Number }, // can represent per month/hour as required

    /* These are all extended object properties for future extension */

    // exampleProperty : {type: String},
    /*
    
     This version is used for separting newly added fields into the base object 
    */

    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);
export default Profile;
