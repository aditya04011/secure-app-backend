import nodemailer from "nodemailer";
import loggingService from "../../../services/logging.service.js";
import { constants } from "../../../utils/constants.utils.js";

const logger = loggingService.getModuleLogger("Core-Notifications","EmailService");

class EmailService {
  constructor() {
    this.isInitialized = false;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Create reusable transporter object using SMTP
      this.transporter = nodemailer.createTransport({
        host: constants.smtp.host,
        port: constants.smtp.port,
        secure: constants.smtp.secure,
        auth: {
          user: constants.smtp.user,
          pass: constants.smtp.password
        },
        tls: {
          rejectUnauthorized: false // Helps in development environments
        }
      });

      // Verify connection
      await this.verifyConnection();
      this.isInitialized = true;
      logger.info("Email service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize SMTP transporter:", error);
      this.isInitialized = false;
      throw new Error("Email service initialization failed");
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("SMTP connection verified successfully");
    } catch (error) {
      logger.error("SMTP connection verification failed:", error);
      throw error;
    }
  }

  /**
   * Sends an email.
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} text - Plain text version of the email
   * @param {string} html - HTML version of the email
   * @returns {Promise<Object>} - Nodemailer send response
   */
  async sendEmail(to, subject, text, html) {
    try {
      if (!this.isInitialized) {
        logger.warn(
          "Email service not initialized, attempting to reinitialize..."
        );
        await this.initializeTransporter();
      }

      if (!constants.smtp.user || !constants.smtp.password) {
        throw new Error("Email credentials not configured");
      }

      logger.info(`Preparing to send email to recipient: ${to}`);

      const mailOptions = {
        from: constants.smtp.from,
        to,
        subject,
        text,
        html: html || text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      logger.error("Error sending email:", error);

      // Check for specific error types and handle accordingly
      if (error.code === "EAUTH") {
        throw new Error(
          "Authentication failed. Please check email credentials."
        );
      } else if (error.code === "ESOCKET") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else if (error.code === "EENVELOPE") {
        throw new Error("Invalid recipient or sender email address.");
      }

      throw error;
    }
  }
}

const emailService = new EmailService();

export default emailService;
