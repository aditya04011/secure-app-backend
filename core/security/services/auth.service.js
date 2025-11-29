import mongoose from "mongoose";
import { generateAccessToken } from "../utils/jwt.utils.js";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";
import Profile from "../../../modules/common/models/profile.model.js";
import { constants } from "../../../utils/constants.utils.js";
import { importJWK, jwtDecrypt } from "jose";
import { UAParser } from "ua-parser-js";

// Initialize the logger for the AuthService
const logger = loggingService.getModuleLogger("Core-Security","AuthService");
const tokenKey = constants.jwt.tokenSecret;

const compressRolesPermissions = (rolesPermissions) => {
  // Use a map to group by role and permission set.
  const grouped = {};
  rolesPermissions.forEach((item) => {
    // Create a unique key based on roleId and permissions.
    // JSON.stringify is used here; for production use, consider a more efficient or secure hash.
    const key = `${item.roleId}-${JSON.stringify(item.permissions)}`;
    if (!grouped[key]) {
      grouped[key] = {
        roleId: item.roleId,
        roleName: item.roleName,
        permissions: item.permissions,
        // branches: [item.branchName],
        // branchIds: [item.branchId],
        branches: [{ branchId: item.branchId, branchName: item.branchName }],
      };
    } else {
      // In case the branch already exists in the array, we avoid duplicates.
      // if (!grouped[key].branches.includes(item.branchName)) {
      //   grouped[key].branches.push(item.branchName);
      // }
      // if (!grouped[key].branchIds.includes(item.branchId)) {
      //   grouped[key].branchIds.push(item.branchId);
      // }
      const branchExists = grouped[key].branches.some(
      (branch) => branch.branchId === item.branchId
    );

    if (!branchExists) {
      grouped[key].branches.push({ branchId: item.branchId, branchName: item.branchName });
    }
    }
  });
  return Object.values(grouped);
};

// Example usage inside your getUserWithPermissionsById function:
// (Assuming that userProfile.userdetails.rolesPermissions is the array to be compressed)

export const getUserWithPermissionsById = async (userId) => {
  logger.info("Fetching user profile with permissions", { userId });

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.info("Invalid userId format", { userId });
      return null;
    }

    const profileWithUserDetails = await Profile.aggregate([
      // Your existing aggregation pipeline steps
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userdetails",
        },
      },
      {
        $unwind: {
          path: "$userdetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$userdetails.roles",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "userdetails.roles.roleId": {
            $cond: {
              if: { $eq: [{ $type: "$userdetails.roles.roleId" }, "string"] },
              then: { $toObjectId: "$userdetails.roles.roleId" },
              else: "$userdetails.roles.roleId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "userdetails.roles.roleId",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: {
          path: "$roleDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "userdetails.rolesPermissions": {
            branchId: "$userdetails.roles.branchId",
            roleId: "$userdetails.roles.roleId",
            roleName: "$roleDetails.roleName",
            permissions: "$roleDetails.permissions",
          },
        },
      },
      {
        $lookup: {
          from: "branches",  
          localField: "userdetails.rolesPermissions.branchId",  
          foreignField: "_id",  
          as: "branchDetails"  
        }
      },
      {
        $unwind: "$branchDetails" 
      },
      {
        $set: {
          "userdetails.rolesPermissions.branchName": "$branchDetails.branchName" 
        }
      },
      {
        $project: {
          "userdetails.rolesPermissions.branchDetails": 0 
        }
      },
      {
        $unset: "roleDetails",
      },
      {
        $group: {
          _id: "$_id",
          profile: { $first: "$$ROOT" },
          rolesPermissions: { $push: "$userdetails.rolesPermissions" },
        },
      },
      {
        $addFields: {
          "profile.userdetails.rolesPermissions": "$rolesPermissions",
        },
      },
      {
        $unset: ["rolesPermissions", "profile.userdetails.roles"],
      },
      {
        $project: { profile: 1 },
      },
    ]);

    if (!profileWithUserDetails || profileWithUserDetails.length === 0) {
      logger.info("No profile found for user", { userId });
      return null;
    }

    // Compress the rolesPermissions to reduce payload size.
    const profile = profileWithUserDetails[0].profile;
    if (profile.userdetails && profile.userdetails.rolesPermissions) {
      profile.userdetails.rolesPermissions = compressRolesPermissions(
        profile.userdetails.rolesPermissions
      );
    }

    logger.info("Successfully retrieved and compressed user profile", {
      userId,
    });
    return profile;
  } catch (error) {
    logger.info("Error fetching user profile", {
      userId,
      error: error.message,
    });
    return null;
  }
};

/**
 * Login a user
 * Logs the operation, validates credentials, and generates an access token.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @param {object} User - User model for database interaction.
 * @returns {Promise<Object|null>} - Login result or null on error
 */

// Log user login and logout activity with browser, OS, and IP info
//  🔁 Reusable logging function for login/logout
export const logUserActivity = (req, User, action = "Activity") => {
  if (!req || !User) return;

  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    "Unknown";

  logger.info(`User ${action}`, {
    userId: User.id || User._id,
    email: User.email,
    ipAddress: ip,
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    deviceType: result.device.type || "Desktop", // e.g., 'mobile', 'tablet', 'console', or undefined (desktop)
    deviceVendor: result.device.vendor || "Unknown",
    deviceModel: result.device.model || "Unknown",
    timestamp: new Date().toISOString(),
  });
};

export const loginUser = async (req, res, next, User) => {
  logger.info("Login attempt", { email: req.body.email });

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      logger.error("Login failed - Missing credentials");
      return next(createError(400, "Email and password are required"));
    }

    // Verify user credentials
    logger.debug("Verifying user credentials", { email });

    const user = await User.findOne({ email });

    if (!user) {
      logger.error("Login failed - Email not found", { email });
      return next(createError(404, "Email not found"));
    }

    if (user.password !== password) {
      logger.error("Login failed - Incorrect password", { email, userId: user._id });
      return next(createError(405, "Incorrect password"));
    }

    if (!user.isActive) {
      logger.error("Login failed - Inactive account", {
        email,
        userId: user._id,
      });
      return next(createError(403, "User account is inactive"));
    }

    // Login successful
    // logger.info("Login successful", { userId: user._id });


    // Validate user version
    logger.info("Checking user version", {
      userId: user._id,
      version: user.version,
    });
    if (![1, 2, 3].includes(user.version)) {
      logger.error("Unsupported user version", {
        userId: user._id,
        version: user.version,
      });
      return next(createError(400, "Unsupported user version"));
    }

    // Extract role and branch information
    const branchRoles = user.roles || [];
    const roleData = branchRoles.map(({ branchName, roleId }) => ({
      branchName,
      roleId,
    }));

    // Generate an access token
    logger.info("Generating access token", { userId: user._id, email });

    const userId = user._id.toString(); // Convert ObjectId to string

    // Fetch user profile with permissions
    user.tokenVersion += 1;
    await user.save();
    // const userProfile = await getUserWithPermissionsById(userId);
    const userProfile = {userdetails: {
      email: user.email,
      userId: userId,
      tokenVersion: user.tokenVersion,
      passwordChangedAt: user.passwordChangedAt,
    }};
    // // If profile not found, create a minimal profile with basic user info
    // if (!userProfile) {
    //   logger.error("No profile found for user, using basic profile", {
    //     userId: user._id,
    //   });
    //   next(createError(404, "Profile not found"));
    // }

    const jwtPayload = JSON.parse(JSON.stringify(userProfile));
    const encryptedToken = await generateAccessToken(jwtPayload);

    logger.info("User logged in successfully", { userId: user._id, email });
    // ✅ Log the login activity
    logUserActivity(req, User, "Login");

    // Return complete user info
    return {
      token: encryptedToken,
      userId: userId
    };
  } catch (error) {
    logger.error("Login process error", {
      email: req.body.email,
      error: error,
    });
    next(createError(500, "Internal server error during login"));
    return null;
  }
};
export async function logoutUser(req, res, next, User) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "No userId found for logout" });
  }

  try {
    logger.info(`Logout initiated for userId: ${userId}`);
    const user = await User.findById(userId);
    if (user) {
      logger.info(
        `User found. Invalidating refresh token for userId: ${userId}`
      );
      // Invalidate the refresh token by incrementing tokenVersion
      user.tokenVersion += 1;
      await user.save();
      logger.info(`Token version incremented for userId: ${userId}`);
    } else {
      logger.warn(`Logout attempt for non-existent userId: ${userId}`);
    }
    // ✅ Log the logout activity
    logUserActivity(req, User, "Logout");
    logger.info(`User logout activity logged for userId: ${userId}`);
    return { message: "Logout successful" };
  } catch (err) {
    logger.error("Error in logout service", { error: err, userId }); // only log serializable part
    next(createError(500, "Error during logout"));
    return null;
  }
}
