import {
  createDocument,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
  getAllDocuments,
 viewDocument,
  downloadDocument,
} from "../services/document.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Modules-Common","DocumentController");

export const documentController = {
  create: async (req, res, next) => {
    try {
      logger.info("Creating a new document", { data: req.body });
      await createDocument(req, res);
    } catch (error) {
      logger.error("Error creating document", { error });
      next(error);
    }
  },
   getAll: async (req, res, next) => {
    try {
      logger.info("Fetching all documents");
      await getAllDocuments(req, res);
    } catch (error) {
      logger.error("Error fetching all documents", { error });
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      logger.info(`Fetching document with ID: ${req.params.id}`);
      await getDocumentById(req, res);
    } catch (error) {
      logger.error("Error fetching document by ID", { error });
      next(error);
    }
  },

  updateById: async (req, res, next) => {
    try {
      logger.info(`Updating document with ID: ${req.params.id}`, {
        data: req.body,
      });
      await updateDocumentById(req, res);
    } catch (error) {
      logger.error("Error updating document", { error });
      next(error);
    }
  },

  deleteById: async (req, res, next) => {
    try {
      logger.info(`Deleting document with ID: ${req.params.id}`);
      await deleteDocumentById(req, res);
    } catch (error) {
      logger.error("Error deleting document", { error });
      next(error);
    }
  },
  view: async (req, res, next) => {
    try {
      logger.info(`Viewing document with ID: ${req.params.id}`);
      await viewDocument(req, res);
    } catch (error) {
      logger.error("Error viewing document", { error });
      next(error);
    }
  },
  
  download: async (req, res, next) => {
    try {
      logger.info(`Downloading document with ID: ${req.params.id}`);
      await downloadDocument(req, res);
    } catch (error) {
      logger.error("Error downloading document", { error });
      next(error);
    }
  },
};

