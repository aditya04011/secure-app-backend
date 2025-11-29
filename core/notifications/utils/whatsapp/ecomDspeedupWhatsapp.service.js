import axios from "axios";
import { constants } from "../../../../utils/constants.utils.js";
import { getMessageTemplate } from "./whatsappMessageTemplates.js";

const { ecomDspeedup } = constants;

/**
 * Send a WhatsApp OTP message via Ecom Dspeedup API.
 *
 * @param {string} phoneNumber - Recipient phone number (with country code, e.g. 91XXXXXXXXXX)
 * @param {string} otp - One-Time Password to send.
 * @param {string|null} params - Optional user type.
 * @param {function} logInfo - Optional logging function.
 * @param {function} logError - Optional error logging function.
 * @returns {Promise<object>} - API response data.
 */

function removeNewLines(text) {
  if (typeof text !== "string") return text;
  return text.replace(/\n/g, " ");
}
export const sendWhatsAppMessageEcomDSpeedUp = async (
  phoneNumber,
  messageType,
  params,
  logInfo,
  logError
) => {
  const { baseUrl, vendorId, fromPhoneNumberId, token } = ecomDspeedup;

  logInfo?.(
    "Preparing to send WhatsApp OTP via Ecom Dspeedup",
    { baseUrl, vendorId, fromPhoneNumberId }
  );
  // ✅ Validate configuration
  if (!baseUrl || !vendorId || !fromPhoneNumberId) {
    const configError = new Error(
      "Ecom Dspeedup configuration missing: Ensure baseUrl, vendorId, and fromPhoneNumberId are set."
    );
    configError.code = "CONFIG_ERROR";

    logError?.("Ecom Dspeedup configuration missing", {
      module: "Core-Notifications",
      source: "WhatsappController",
      stack: "ecomDspeedupWhatsapp.service.js:config-check",
      metadata: { baseUrl, vendorId, fromPhoneNumberId, token },
    });

    throw configError;
  }

  // ✅ Prepare API request
  const url = `${baseUrl}/${vendorId}/contact/send-template-message`;
  // const messageBody = `Your verification code is ${otp}. Please do not share it with anyone.`;
  let caption = getMessageTemplate(messageType, params);
  const headerName = params?.message_caption || messageType || "Notification";
  const payload = {
    "from_phone_number_id": fromPhoneNumberId,
    "phone_number": phoneNumber,
    "message_body": "Hello",
    "template_language": "en_US",
    "template_name": "iscinfo",
    "headerDocument": "document_url",
    "headerImage": "image_url",
    "headerVideo": "video_url",
    "headerDocumentName": "headerDocumentName",
    "copy_code":"value",
    "variables":{
        "field_1": headerName,
        "field_2":removeNewLines(caption)
        
    }
  }

  logInfo?.(
    "Preparing to send WhatsApp OTP via Ecom Dspeedup",
    {
      module: "Core-Notifications",
      source: "WhatsappController",
      stack: "ecomDspeedupWhatsapp.service.js:68",
      metadata: { payload },
    }
  );

  try {
    const startTime = Date.now();

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const duration = Date.now() - startTime;

    const responseData = {
      phoneNumber,
      responseTime: `${duration}ms`,
      status: response.status,
      responseData: response.data,
    };

    // ✅ Log response details
    if (response.status >= 200 && response.status < 300) {
      logInfo?.("WhatsApp OTP sent successfully via Ecom Dspeedup", {
        module: "Core-Notifications",
        source: "WhatsappController",
        stack: "ecomDspeedupWhatsapp.service.js:92",
        metadata: responseData,
      });
      return response.data;
    } else {
      logError?.("Unexpected status in Ecom Dspeedup response", {
        module: "Core-Notifications",
        source: "WhatsappController",
        stack: "ecomDspeedupWhatsapp.service.js:94",
        metadata: responseData,
      });

      const apiError = new Error(
        `Ecom Dspeedup responded with status ${response.status}`
      );
      apiError.code = "API_RESPONSE_ERROR";
      apiError.details = response.data;
      throw apiError;
    }
  } catch (err) {
    const isAxios = err?.isAxiosError;

    const errorMetadata = {
      phoneNumber,
      errorType: isAxios ? "AXIOS_ERROR" : "UNKNOWN_ERROR",
      status: err?.response?.status || "unknown",
      message: err?.message,
      responseData: err?.response?.data || null,
    };

    logError?.("Failed to send WhatsApp OTP via Ecom Dspeedup", {
      module: "Core-Notifications",
      source: "WhatsappController",
      stack: "ecomDspeedupWhatsapp.service.js:catch",
      metadata: errorMetadata,
    });

    const enrichedError = new Error(
      "Failed to send WhatsApp OTP via Ecom Dspeedup"
    );
    enrichedError.code = isAxios ? "AXIOS_ERROR" : "UNKNOWN_ERROR";
    enrichedError.original = err;
    enrichedError.details = {
      phoneNumber,
      ...(isAxios &&
        err?.response && {
          status: err.response.status,
          responseData: err.response.data,
        }),
    };

    throw enrichedError;
  }
};
