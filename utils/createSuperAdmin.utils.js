import mongoose from "mongoose";
// Adjust these paths based on your project structure
import Role from "../core/security/models/roles.model.js";
import Project from "../modules/taskmanagement/models/project.model.js";
import User from "../core/security/models/user.model.js";
import Profile from "../modules/common/models/profile.model.js";
// Optional: Use your own logger or default to console
const defaultLogger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.log
};

// --- Super Admin Specific Data (Extracted from your JSON) ---
const superAdminData = {
  _id: { $oid: "67dad60bac8b905af12d0739" }, // Optional: use old ID if desired and unique
  fullname: "Super Admin",
  username: "superadmin-isc",
  email: "superadmin@isc.guru",
  password: "Welcome1", // WARNING: Plain text password. Hashing is HIGHLY recommended.
  phoneNumber: "9676855959",
  designation: "Super Admin", // Used for Profile occupation
  role: "superadmin", // This is the role name to look up in the Role collection
  branch: [
    "rajajiNagar1stBlock",
    "rajajiNagar4thBlock",
    "rajajiNagarPUC",
    "malleshwaram",
    "malleshwaramPUC",
    "basaveshwarNagar",
    "basaveshwarNagarPUC",
    "nagarbhavi"
  ],
  isActive: true,
  version: 1
  // Timestamps will be handled by Mongoose
};

// Helper function (can be moved to a shared utils file)
const splitFullName = (fullname) => {
  if (!fullname || typeof fullname !== "string") {
    return { firstName: "Unknown", lastName: "User" };
  }
  const parts = fullname.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  return { firstName, lastName: lastName || firstName }; // Use firstName as lastName if only one name part
};

/**
 * Creates the specific Super Admin user ('superadmin-isc'),
 * their Profile (type 'admin'), and their Self Assigned Project.
 *
 * @param {object} [options] - Optional configuration.
 * @param {object} [options.logger=console] - Logger instance.
 * @returns {Promise<object>} - Object indicating success or failure, with created IDs or error.
 */
const createSuperAdmin = async (options = {}) => {
  const logger = options.logger || defaultLogger;
  logger.info(`Attempting to create Super Admin user: ${superAdminData.email}`);

  let createdUser = null; // Keep track of created user for potential cleanup

  try {
    // 1. Check if Super Admin User already exists
    const existingUser = await User.findOne({ email: superAdminData.email });
    if (existingUser) {
      logger.warn(
        `Super Admin user with email ${superAdminData.email} already exists. Skipping creation.`
      );
      // Optionally find and return existing profile/project IDs if needed
      const existingProfile = await Profile.findOne({
        userId: existingUser._id
      });
      // const existingProject = await Project.findOne({ owner: existingUser._id, title: "Self Assigned" }); // Less reliable check
      return {
        success: true, // Indicate success as it already exists
        message: "Super Admin already exists.",
        userId: existingUser._id,
        profileId: existingProfile?._id
        // projectId: existingProject?._id // Might not exist or multiple could match title
      };
    }

    // 2. Find the Role ObjectId for the User model (using 'owner' role from old data)
    const roleName = superAdminData.role; // 'owner'
    const ownerRole = await Role.findOne({ roleName: roleName });
    if (!ownerRole) {
      logger.error(
        `Required Role '${roleName}' not found in the database. Cannot create Super Admin.`
      );
      throw new Error(`Role '${roleName}' not found.`);
    }
    const roleId = ownerRole._id;
    logger.debug(`Role found for Super Admin: ${roleName} -> ${roleId}`);

    // 3. Prepare and Create the User
    logger.debug(`Preparing user data for ${superAdminData.email}.`);

    // WARNING: Storing plain text password. Implement hashing in production.
    if (superAdminData.password === "Welcome1") {
      logger.warn(
        `Using known insecure default password for ${superAdminData.email}. Hashing is critical.`
      );
    }

    // Map branch names to the required roles structure
    const userRoles = superAdminData.branch.map((branchName) => ({
      branchName,
      roleId // Use the found 'owner' roleId for the User model's roles
    }));

    const newUser = new User({
      // _id: new mongoose.Types.ObjectId(superAdminData._id.$oid), // Uncomment to use old ID
      email: superAdminData.email,
      username: superAdminData.username,
      password: superAdminData.password, // Store plain text (BAD PRACTICE!)
      roles: userRoles,
      isActive: superAdminData.isActive,
      version: superAdminData.version
    });

    createdUser = await newUser.save();
    logger.info(
      ` -> Super Admin User created successfully: ${createdUser._id}`
    );

    // 4. Create the Profile (Type: 'admin') linked to the User
    logger.debug(`Creating profile for Super Admin user: ${createdUser._id}`);
    const { firstName, lastName } = splitFullName(superAdminData.fullname);

    // *** Specific Profile Type for this user ***
    const profileType = "admin";
    logger.debug(`Setting profile type for Super Admin: ${profileType}`);

    const newProfile = new Profile({
      type: profileType, // Explicitly set to 'admin' for this user
      userId: createdUser._id,
      firstName: firstName,
      lastName: lastName,
      primaryNumber: superAdminData.phoneNumber.replace(/\s/g, ""), // Clean phone
      primaryEmail: superAdminData.email,
      occupation: superAdminData.designation, // Use designation for occupation
      version: superAdminData.version
      // Add any other relevant fields from superAdminData if needed
    });

    const createdProfile = await newProfile.save();
    logger.info(
      ` -> Super Admin Profile created successfully: ${createdProfile._id} (Type: ${profileType})`
    );

    // 5. Create the default "Self Assigned" Project
    logger.debug(
      `Creating self-assigned project for Super Admin user: ${createdUser._id}`
    );
    const projectData = {
      title: "Self Assigned",
      description: `Default project for self-assigned tasks`,
      owner: createdUser._id, // Link to the NEW User ID
      assignee: [createdUser._id], // Link to the NEW User ID
      branch: superAdminData.branch, // Assign project to all user branches
      notes: [],
      task: [],
      targetDate: null,
      version: 1
    };

    const selfAssignedProject = new Project(projectData);
    const createdProject = await selfAssignedProject.save();
    logger.info(
      ` -> Self-assigned project created successfully: ${createdProject._id}`
    );

    logger.info(`Successfully created Super Admin user and associated data.`);
    return {
      success: true,
      message: "Super Admin created successfully.",
      userId: createdUser._id,
      profileId: createdProfile._id,
      projectId: createdProject._id
    };
  } catch (error) {
    logger.error(
      `Error creating Super Admin (${superAdminData.email}): ${error.message}`,
      { stack: error.stack }
    );

    // Optional: Attempt cleanup if user was created but subsequent steps failed
    if (createdUser && createdUser._id) {
      try {
        logger.warn(
          `Attempting to clean up partially created Super Admin user: ${createdUser._id}`
        );
        await User.findByIdAndDelete(createdUser._id);
        // Note: Also consider deleting Profile/Project if they were created before the final error
        logger.info(`Cleaned up user ${createdUser._id}.`);
      } catch (cleanupError) {
        logger.error(
          `Error during cleanup for user ${createdUser._id}: ${cleanupError.message}`
        );
      }
    }

    return {
      success: false,
      message: `Failed to create Super Admin: ${error.message}`,
      error: error
    };
  }
};

// --- How to Use ---
/*
// Assuming you have connected to MongoDB and have the models available

// Example usage within an async function:
async function setupSuperAdmin() {
    const result = await createSuperAdmin({ logger: yourLoggerInstance }); // Pass your logger if you have one

    if (result.success) {
        console.log("Super Admin setup complete or already exists.");
        console.log("User ID:", result.userId);
        console.log("Profile ID:", result.profileId);
        console.log("Project ID:", result.projectId); // May be undefined if user already existed
    } else {
        console.error("Super Admin setup failed:", result.message);
    }
}

// Call the setup function
// setupSuperAdmin().then(() => mongoose.connection.close()); // Example with DB closing
*/

export default createSuperAdmin; // Export the utility function
