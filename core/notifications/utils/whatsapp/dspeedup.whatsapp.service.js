import axios from "axios";
// import { constants } from "../../../../utils/constants.utils.js";
import loggingService from "../../../../services/logging.service.js";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

// const { dspeedup } = constants;
const logger = loggingService.getModuleLogger(
  "Core-Notifications",
  "Dspeedup Whatsapp Service"
);

const url = process.env.DSPEEDUP_API_BASE_URL;
const fromPhoneNumberId = process.env.DSPEEDUP_INSTANCE_ID;
const token = process.env.DSPEEDUP_API_TOKEN;

/**
 * Send a WhatsApp task message with custom caption via DSpeedUp API.
 *
 * @param {string} phoneNumber - recipient phone number (with country code, e.g., 91XXXXXXXXXX)
 * @param {string} messageType - e.g. taskAssignment, taskCompleted
 * @param {object} params - dynamic params for the caption
 * @param {function} logInfo - optional logging function
 * @param {function} logError - optional error logging function
 */
export const sendWhatsAppMessageDSpeedUp = async (
  phoneNumber,
  messageType,
  params,
  logInfo,
  logError
) => {
  logger.info("Preparing to send WhatsApp message via DSpeedUp", {
    phoneNumber,
    messageType
  });

  // Validate DSpeedUp configuration
  if (!url || !token) {
    logger.error("Dspeedup configuration missing", {
      hasUrl: !!url,
      hasToken: !!token
    });
    const configError = new Error(
      "Dspeedup configuration missing: Ensure DSPEEDUP_WHATSAPP_URL and DSPEEDUP_WHATSAPP_TOKEN are set."
    );
    configError.code = "CONFIG_ERROR";
    throw configError;
  }

  // Build the caption text
  const caption = buildCaption(messageType, params);

  // Full URL to hit the DSpeedUp API
  const fullUrl = `${url}?token=${token}`;

  const payload = {
    phone_number: phoneNumber,
    message_body: caption
  };

  // Add optional from_phone_number_id if it's configured
  if (fromPhoneNumberId) {
    payload.from_phone_number_id = fromPhoneNumberId;
  } else {
    logger.warn("fromPhoneNumberId is missing. Message may be sent without a 'from' number.");
  }

  try {
    logger.debug("Sending Dspeedup request", { url: fullUrl, payload });
    const startTime = Date.now();
    const response = await axios.post(fullUrl, payload);
    const duration = Date.now() - startTime;

    const logData = {
      phoneNumber,
      status: response.status,
      responseTime: `${duration}ms`,
      responseData: response.data
    };

    if (response.data?.result === "success") {
      logInfo?.("Message sent successfully via DSpeedup", logData);
      return response.data;
    } else {
      logError?.("Dspeedup responded with a non-success result", logData);
      const apiError = new Error(
        `Dspeedup API responded with result: ${response.data?.result}`
      );
      apiError.code = "API_RESPONSE_ERROR";
      apiError.details = response.data;
      throw apiError;
    }
  } catch (err) {
    const isAxios = err?.isAxiosError;
    const errorLogData = {
      phoneNumber,
      errorType: isAxios ? "AXIOS_ERROR" : "UNKNOWN_ERROR",
      status: err?.response?.status || "unknown",
      message: err?.message,
      responseData: err?.response?.data || null
    };

    logError?.("Failed to send message via DSpeedup", errorLogData);

    const enrichedError = new Error("Failed to send message via DSpeedup");
    enrichedError.code = isAxios ? "AXIOS_ERROR" : "UNKNOWN_ERROR";
    enrichedError.original = err;
    enrichedError.details = {
      phoneNumber,
      url: dspeedup.url, // Log the base URL without token
      message: err?.message
    };
    throw enrichedError;
  }
};

/**
 * Build the caption based on the message type and params.
 * @param {string} messageType - Type of message (e.g. taskAssignment)
 * @param {object} params - Parameters to build dynamic content
 * @returns {string} - The generated message caption
 */
const buildCaption = (messageType, params) => {
  let caption = "";
  switch (messageType) {
    case "taskAssignment":
      caption = `Hello ${params.assigneeUsername}\n\nYou have a new task assigned by ${params.createrUsername}. Check it here: ${params.taskLink}`;
      break;
    case "taskCompleted":
      caption = `Hello ${params.createrUsername}\n\n${params.assigneeUsername} has marked the task "${params.taskTitle}" as completed on ${params.completionDate}. Check it here: ${params.taskLink}`;
      break;
    case "taskExtensionRequested":
      caption = `Hi ${params.createrUsername}\n\n${params.assigneeUsername} has requested an extension for the task "${params.taskTitle}" until ${params.extendDate}. Check it here: ${params.taskLink}`;
      break;
    case "taskExtensionStatus":
      caption = `Hi ${params.assigneeUsername}\n\nYour extension request for "${params.taskTitle}" was ${params.status}. New Target Date: ${params.extendDate}. Check it here: ${params.taskLink}`;
      break;
    case "upcoming_installment":
      caption = `Hello,\n\nThis is a reminder that Installment #${params.installmentNo} of ₹${params.amount} is due on ${params.dueDate}. Please ensure timely payment to avoid late fees.`;
      break;
    // 🔔 Overdue installment alert
    case "overdue_installment":
      caption = `Hello,\n\nInstallment #${params.installmentNo} of ₹${params.amount} was due on ${params.dueDate} (${params.daysOverdue} days ago) and is still pending. Kindly clear the dues at the earliest.`;
      break;
    default:
      caption = `Hello ${params.assigneeUsername}\n\nYou have a new task update. Check it here: ${params.taskLink}`;
  }
  return caption;
};
