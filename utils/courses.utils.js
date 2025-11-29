// import Course from "../modules/courses/models/courses.model.js";
// import FeeStructure from "../modules/fees/models/feeStructure.model.js";
// import Fee from "../modules/fees/models/feeStructure.model.js"; // Import Fee model
// import loggingService from "../services/logging.service.js";

// const logger = loggingService.getModuleLogger("Courses Utils");

// // List of default courses and subjects
// const defaultCourses = [
//   {
//     courseName: "8th-CBSE",
//     standard: "8th",
//     board: "CBSE",
//     subjects: ["Mathematics", "Science", "Social"],
//   },
//   {
//     courseName: "8th-ICSE",
//     standard: "8th",
//     board: "ICSE",
//     subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
//   },
//   {
//     courseName: "8th-SSLC",
//     standard: "8th",
//     board: "SSLC",
//     subjects: ["Mathematics", "Science", "Social", "Language"],
//   },
//   {
//     courseName: "9th-CBSE",
//     standard: "9th",
//     board: "CBSE",
//     subjects: ["Mathematics", "Science", "Social"],
//   },
//   {
//     courseName: "9th-ICSE",
//     standard: "9th",
//     board: "ICSE",
//     subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
//   },
//   {
//     courseName: "9th-SSLC",
//     standard: "9th",
//     board: "SSLC",
//     subjects: ["Mathematics", "Science", "Social", "Language"],
//   },
//   {
//     courseName: "10th-CBSE",
//     standard: "10th",
//     board: "CBSE",
//     subjects: ["Mathematics", "Science", "Social"],
//   },
//   {
//     courseName: "10th-ICSE",
//     standard: "10th",
//     board: "ICSE",
//     subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
//   },
//   {
//     courseName: "10th-SSLC",
//     standard: "10th",
//     board: "SSLC",
//     subjects: ["Mathematics", "Science", "Social", "Language"],
//   },
//   {
//     courseName: "PUC-1 (PCM)-CBSE",
//     standard: "PUC-1 (PCM)",
//     board: "CBSE",
//     subjects: ["Physics", "Chemistry", "Mathematics"],
//   },
//   {
//     courseName: "PUC-1 (PCMB)-CBSE",
//     standard: "PUC-1 (PCMB)",
//     board: "CBSE",
//     subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
//   },
//   {
//     courseName: "PUC-1 (Commerce)-CBSE",
//     standard: "PUC-1 (Commerce)",
//     board: "CBSE",
//     subjects: ["Accounts", "Business", "Statistics", "Economics"],
//   },
//   {
//     courseName: "PUC-2 (PCM)-CBSE",
//     standard: "PUC-2 (PCM)",
//     board: "CBSE",
//     subjects: ["Physics", "Chemistry", "Mathematics"],
//   },
//   {
//     courseName: "PUC-2 (PCMB)-CBSE",
//     standard: "PUC-2 (PCMB)",
//     board: "CBSE",
//     subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
//   },
//   {
//     courseName: "PUC-2 (Commerce)-CBSE",
//     standard: "PUC-2 (Commerce)",
//     board: "CBSE",
//     subjects: ["Accounts", "Business", "Statistics", "Economics"],
//   },
// ];

// // Function to save default courses to the database
// const saveDefaultCourses = async () => {
//   logger.info("Saving default courses...");
//   try {
//     for (const course of defaultCourses) {
//       // Retrieve the correct feeId based on standard and board
//       const fee = await FeeStructure.findOne({
//         standard: course.standard,
//         board: course.board,
//       });

//       if (!fee) {
//         logger.error(
//           `No fee found for ${course.standard} - ${course.board}. Skipping course creation.`
//         );
//         continue; // Skip this course if no corresponding fee is found
//       }

//       const existingCourse = await Course.findOne({
//         courseName: course.courseName,
//       });

//       if (existingCourse) {
//         logger.info(
//           `Course ${course.courseName} already exists. Updating details...`
//         );
//         existingCourse.subjects = course.subjects;
//         existingCourse.feeId = fee._id; // Update feeId
//         await existingCourse.save();
//       } else {
//         logger.info(`Creating new Course ${course.courseName}...`);
//         const newCourse = new Course({
//           courseName: course.courseName,
//           subjects: course.subjects,
//           feeId: fee._id, // Assign feeId from Fee model
//         });
//         await newCourse.save();
//       }
//     }
//     logger.info("Default courses saved successfully.");
//   } catch (error) {
//     logger.error("Error saving default courses:", error);
//     throw error;
//   }
// };

// export { saveDefaultCourses };


import Course from "../modules/courses/models/courses.model.js";
import Subject from "../modules/subjects/models/subject.model.js"; // Assuming Subject model exists
import loggingService from "../services/logging.service.js";

const logger = loggingService.getModuleLogger("Global-Utils","Courses Utils");

const defaultCourses = [
  {
    courseName: "8th-CBSE",
    academicYear: 2025,
    standard: 8,
    board: "CBSE",
    subjects: ["Mathematics", "Science", "Social"],
    modeOfDelivery: "offline",
  },
  {
    courseName: "8th-ICSE",
    academicYear: 2025,
    standard: 8,
    board: "ICSE",
    subjects: ["Mathematics", "Physics", "Chemistry", "Biology"],
    modeOfDelivery: "online",
  },
  {
    courseName: "9th-CBSE",
    academicYear: 2025,
    standard: 9,
    board: "CBSE",
    subjects: ["Mathematics", "Science", "Social"],
    modeOfDelivery: "offline",
  }
];

const saveDefaultCourses = async () => {
  logger.info("Saving default courses...");
  try {
    for (const course of defaultCourses) {
      const subjectIds = await Promise.all(
        course.subjects.map(async (subjectName) => {
          const subject = await Subject.findOne({ name: subjectName });
          return subject ? subject._id : null;
        })
      );

      const existingCourse = await Course.findOne({
        courseName: course.courseName,
        academicYear: course.academicYear,
      });

      // Validate publishDate before using it
      const publishDate = course.publishDate && !isNaN(new Date(course.publishDate).getTime())
        ? new Date(course.publishDate)
        : undefined;

      if (existingCourse) {
        logger.info(`Updating existing course: ${course.courseName}...`);
        existingCourse.subjectIds = subjectIds.filter(Boolean);
        existingCourse.modeOfDelivery = course.modeOfDelivery;
        existingCourse.fee = course.fee;
        
        // Only set publishDate if it's valid
        if (publishDate) {
          existingCourse.publishDate = publishDate;
        }

        // Handle documentIds for online courses
        if (course.modeOfDelivery === "online" && course.documentIds) {
          existingCourse.documentIds = course.documentIds.map((id) => id.trim());
        }

        await existingCourse.save();
      } else {
        logger.info(`Creating new course: ${course.courseName}...`);
        const newCourse = new Course({
          courseName: course.courseName,
          academicYear: course.academicYear,
          standard: course.standard,
          subjectIds: subjectIds.filter(Boolean),
          fee: course.fee,
          modeOfDelivery: course.modeOfDelivery,
          publishDate:publishDate || null, // Only assigned if it's valid
          documentIds: course.modeOfDelivery === "online" && course.documentIds
            ? course.documentIds.map((id) => id.trim())
            : [],
        });

        await newCourse.save();
      }
    }
    logger.info("Default courses saved successfully.");
  } catch (error) {
    logger.error("Error saving default courses:", error);
    throw error;
  }
};

export { saveDefaultCourses };



