// WhatsAppService.js
import axios from "axios";
import { constants } from "../../../utils/constants.utils.js";
import loggingService from "../../../services/logging.service.js"; // Adjust the path as necessary
import dotenv from 'dotenv';

dotenv.config(); 
const logger = loggingService.getModuleLogger("Core-Notifications","WhatsAppService");

// class WhatsAppService {
//   constructor() {
//     this.apiUrl = constants.whatsapp.url;
//   }

//   /**
//    * Sends a WhatsApp text message.
//    * @param {string} to - Recipient phone number in international format (e.g., +1234567890).
//    * @param {string} message - The message content.
//    * @returns {Promise<Object>} - The API response.
//    */
//   async sendMessage(recipient, message) {
//     try {
//       logger.info(`Preparing to send message to recipient: ${recipient}`);
//       const payload = {
//         chatId: `${recipient}@c.us`,
//         message
//       };

//       const response = await axios.post(this.apiUrl, payload, {
//         headers: {
//           "Content-Type": "application/json"
//         }
//       });

//       if (response.status === 200 || response.status === 201) {
//         logger.info("WhatsApp message sent successfully:", response.data);
//         return response.data;
//       } else {
//         logger.error(`WhatsApp API responded with status ${response.status}`);
//         throw new Error(
//           `WhatsApp API responded with status ${response.status}`
//         );
//       }
//     } catch (error) {
//       logger.error(
//         "Error sending WhatsApp message:",
//         error.response ? error.response.data : error.message
//       );
//       throw error;
//     }
//   }
// }

// const whatsappService = new WhatsAppService();

// export default whatsappService;

import { sendWhatsAppMessageGreenApi } from "../utils/whatsapp/greenapi.whatsapp.service.js";
import { sendWhatsAppMessageDSpeedUp } from "../utils/whatsapp/dspeedup.whatsapp.service.js";
import { sendWhatsAppMessageEcomDSpeedUp } from "../utils/whatsapp/ecomDspeedupWhatsapp.service.js";
const provider = process.env.WHATSAPP_PROVIDER?.toLowerCase();

/**
 * Unified WhatsApp message sender.
 *
 * This function decides which provider to use (GreenAPI or DSpeedUp)
 * based on the WHATSAPP_PROVIDER env variable.
 *
 * @param {string} phoneNumber - recipient phone number
 * @param {string} messageType - e.g. taskAssignment, taskCompleted
 * @param {object} params - dynamic params for caption
 * @param {function} logInfo - optional logging function
 * @param {function} logError - optional error logging function
 */
export const sendWhatsAppMessage = async (
  phoneNumber,
  messageType,
  params,
  logInfo,
  logError
) => {
  if (!provider) {
    throw new Error("WHATSAPP_PROVIDER not set in .env");
  }

  switch (provider) {
    case "greenapi":
      return await sendWhatsAppMessageGreenApi(phoneNumber, messageType, params, logInfo, logError);

    case "dspeedup":
      return await sendWhatsAppMessageDSpeedUp(phoneNumber, messageType, params, logInfo, logError);
    case "ecom_dspeedup":
      return await sendWhatsAppMessageEcomDSpeedUp(phoneNumber, messageType, params, logInfo, logError);
    default:
      throw new Error(`Unsupported WhatsApp provider: ${provider}`);
  }
};
