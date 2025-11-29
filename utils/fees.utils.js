import FeeStructure from "../modules/fees/models/feeStructure.model.js";
import loggingService from "../services/logging.service.js";

const logger = loggingService.getModuleLogger("Global-Utils","Fees Utils");

// List of standard boards and their respective fee amounts
const defaultFees = [
  {
    academicYear: 2025,
    subjectIds: ["2001", "2002", "2003"],
    feeAmount: 13500,
    notes: "",
  },
  {
    academicYear: 2025,
    subjectIds: ["2001", "2005", "2006", "2007"],
    feeAmount: 19100,
    notes: "",
  },
  {
    academicYear: 2025,
    subjectIds: ["2001", "2002", "2003", "2004"],
    feeAmount: 17500,
    notes: "",
  },
];

// Function to save the default fees to the database
const saveDefaultFees = async () => {
  logger.info("Saving default fees...");
  try {
    for (const fee of defaultFees) {
      const existingFee = await FeeStructure.findOne({
        academicYear: fee.academicYear,
        subjectIds: fee.subjectIds,
      });

      if (existingFee) {
        // Update existing fee record
        logger.info(
          `Fee for academicYear ${fee.academicYear} with subjects ${fee.subjectIds} already exists. Updating details...`
        );
        existingFee.feeAmount = fee.feeAmount;
        existingFee.notes = fee.notes;
        await existingFee.save();
      } else {
        // Create new fee record if not present
        logger.info(
          `Creating new Fee for academicYear ${fee.academicYear} with subjects ${fee.subjectIds}...`
        );
        const newFee = new FeeStructure({
          academicYear: fee.academicYear,
          subjectIds: fee.subjectIds,
          feeAmount: fee.feeAmount,
          notes: fee.notes,
        });
        await newFee.save();
      }
    }
    logger.info("Default fees saved successfully.");
  } catch (error) {
    logger.error("Error saving default fees:", error);
    throw error;
  }
};

export { saveDefaultFees };
