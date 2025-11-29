import * as commonDataFetchService from "../services/commonDataFetch.service.js";
import loggingService from "../../../services/logging.service.js";
// import Feedback from "../../feedback/models/feedback.model.js";
// import WorksheetsAndAssessments from '../../assessments/models/worksheetsAndAssessments.model.js'
// import Subject from '../../subjects/models/subject.model.js';
// import Schedule from '../../schedules/models/schedule.model.js';
// import Attendance from '../../attendance/models/attendance.model.js';
// import PTM from '../../feedback/models/ptm.model.js';
// import Profile from '../../common/models/profile.model.js';
// import Batch from '../../batches/models/batch.model.js'
// import Admission from '../../admissions/models/admission.model.js'
// import Payment from '../../fees/models/payment.model.js'
// import Enquiry from '../../enquiries/models/enquiries.model.js'
// import Inventory from '../../administration/models/inventory.model.js'
// import Expenses from '../../administration/models/expenses.model.js'
// import ClassRoom from "../../branches/models/classroom.model.js"
// import Calendar from "../../schedules/models/calendar.model.js"
import User from "../../../core/security/models/user.model.js"
import Notification from "../../../core/notifications/models/notification.model.js";
// import Course from "../../courses/models/courses.model.js";
// import FeeStructure from "../../fees/models/feeStructure.model.js";
// const models = {
//   WorksheetsAndAssessments,
//   Subject,
//   Schedule,
//   Attendance,
//   PTM,
//   Profile,
//   Batch,
//   Feedback,
//   Admission,
//   Payment,
//   Enquiry,
//   Inventory,
//   Expenses,
//   ClassRoom,
//   Calendar,
//   User, 
//   Course,
//   FeeStructure
// };
import { loadAllModels } from "../../../utils/loadAllModels.js";
const modelsData = await loadAllModels();
const logger = loggingService.getModuleLogger("Modules-Common","CommonDataFetchController");
const models = {...modelsData, User, Notification}
const commonDataFetchController = {
  getByIdAndModelAndUpdatePartial: async (req, res, next) => {
    const { modelName, id } = req.params;
    const data = req.body;
    try {
      logger.info(`updating partially ${modelName} with ID: ${id}`);
      const modelData = await commonDataFetchService.partialUpdateByIdAndModel(
        modelName,
        id,
        data,
        models
      );

      if (!modelData) {
        logger.warn(`${modelName} not found with ID: ${id}`);
        return res.status(404).json({ error: `${modelName} not found` });
      }

      return res.status(200).json(modelData);
    } catch (error) {
      logger.error(
        `Error updating partially  ${modelName} with ID: ${id}: ${error.message}`
      );
      return res
        .status(500)
        .json({ error: "Failed to updating partially record" });
    }
  },
  getByIdAndModel: async (req, res, next) => {
    const { modelName, id } = req.params;
    try {
      logger.info(`Fetching ${modelName} with ID: ${id}`);
      const modelData = await commonDataFetchService.getDataByIdAndModel(
        req,
        res,
        models
      );

      if (!modelData) {
        logger.warn(`${modelName} not found with ID: ${id}`);
        return res.status(404).json({ error: `${modelName} not found` });
      }

      return res.status(200).json(modelData);
    } catch (error) {
      logger.error(
        `Error fetching ${modelName} with ID: ${id}: ${error.message}`
      );
      return res.status(500).json({ error: "Failed to fetch record" });
    }
  },
  getAllByModel: async (req, res, next) => {
    const { modelName } = req.params;
    try {
      logger.info(`Fetching related records for model: ${modelName}`);
      const modelData = await commonDataFetchService.getAllDataByModel(
        req,
        res,
        models
      );
      res.status(200).json(modelData);
    } catch (error) {
      logger.error(
        `Error fetching all records for model: ${modelName}: ${error.message}`
      );
      next(error);
    }
  },
};

export default commonDataFetchController;
