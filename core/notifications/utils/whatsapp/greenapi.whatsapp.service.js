import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config(); // load .env file

// Load config from environment
const baseUrl = process.env.GREENAPI_BASE_URL;
const instanceId = process.env.GREENAPI_INSTANCE_ID;
const token = process.env.GREENAPI_TOKEN;

/**
 * Send a WhatsApp message (with optional logo image).
 *
 * @param {string} phoneNumber - recipient phone number without +91
 * @param {string} messageType - e.g. taskAssignment, upcoming_installment, overdue_installment
 * @param {object} params - dynamic params for the caption
 * @param {function} logInfo - optional logging function
 * @param {function} logError - optional error logging function
 */
export const sendWhatsAppMessageGreenApi = async (
  phoneNumber,
  messageType,
  params,
  logInfo,
  logError
) => {
  const chatId = `91${phoneNumber}@c.us`;

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

    // 🔔 Upcoming installment reminder
    case "upcoming_installment":
      caption = `Hello,\n\nThis is a reminder that Installment #${params.installmentNo} of ₹${params.amount} is due on ${params.dueDate}. Please ensure timely payment to avoid late fees.`;
      break;

    // 🔔 Overdue installment alert
    case "overdue_installment":
      caption = `Hello,\n\nInstallment #${params.installmentNo} of ₹${params.amount} was due on ${params.dueDate} (${params.daysOverdue} days ago) and is still pending. Kindly clear the dues at the earliest.`;
      break;

    default:
      caption = `Hello ${params.assigneeUsername || "User"}\n\nYou have a new update.`;
  }

  if (!baseUrl || !instanceId || !token) {
    const configError = new Error(
      "GreenAPI configuration missing: Ensure GREENAPI_BASE_URL, GREENAPI_INSTANCE_ID, GREENAPI_TOKEN are set in .env"
    );
    configError.code = "CONFIG_ERROR";
    logError?.("GreenAPI configuration missing", { baseUrl, instanceId, token });
    throw configError;
  }

  const fileUrl = `${baseUrl}/waInstance${instanceId}/sendFileByUpload/${token}`;
  const textUrl = `${baseUrl}/waInstance${instanceId}/sendMessage/${token}`;

  try {
    const logoPath = path.resolve("public/logo.png");
    let response;
    let uploadUrlUsed = false;

    if (fs.existsSync(logoPath)) {
      // ✅ Send with image
      const formData = new FormData();
      formData.append("chatId", chatId);
      formData.append("caption", caption);
      formData.append("file", fs.createReadStream(logoPath), "logo.png");

      const startTime = Date.now();
      response = await axios.post(fileUrl, formData, {
        headers: formData.getHeaders(),
      });
      uploadUrlUsed = true;
      response.duration = `${Date.now() - startTime}ms`;
    } else {
      // ✅ Send only text (no image)
      const startTime = Date.now();
      response = await axios.post(textUrl, {
        chatId,
        message: caption,
      });
      response.duration = `${Date.now() - startTime}ms`;
    }

    const logData = {
      phoneNumber,
      chatId,
      status: response.status,
      responseTime: response.duration,
      responseData: response.data,
      withImage: uploadUrlUsed,
    };

    if (response.status >= 200 && response.status < 300) {
      logInfo?.("WhatsApp message sent successfully", logData);
      return response.data;
    } else {
      logError?.("Unexpected status in GreenAPI response", logData);
      throw new Error(`GreenAPI responded with status ${response.status}`);
    }
  } catch (err) {
    const isAxios = err?.isAxiosError;

    const errorLogData = {
      phoneNumber,
      chatId,
      errorType: isAxios ? "AXIOS_ERROR" : "UNKNOWN_ERROR",
      status: err?.response?.status || "unknown",
      message: err?.message,
      responseData: err?.response?.data || null,
      stack: err?.stack,
    };

    logError?.("Failed to send WhatsApp message", errorLogData);
    throw err;
  }
};

/**
 * Format date as DD/MM/YYYY
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
