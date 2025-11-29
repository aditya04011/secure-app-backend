import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";
import multer from "multer";
import path from "path";
import Document from "../models/document.model.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = loggingService.getModuleLogger("Modules-Common","DocumentManagementService");
const uploadPath = path.join(__dirname, "../../../uploads/documents");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  logger.info(`Created upload directory: ${uploadPath}`);
}

const allowedMimeTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/msword", // .doc
  "application/pdf", // .pdf
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg", // .jpeg, .jpg
  "image/png", // .png
  "image/gif" // .gif
]; 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    const uniqueTimestamp = Date.now();
    const generatedFileName = `${baseName}-${uniqueTimestamp}${fileExtension}`;

    req.fileGeneratedName = generatedFileName;
    req.originalFileName = file.originalname;
    cb(null, generatedFileName);
  }
});


const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      createError(
        400,
        `Unsupported file type: ${file.originalname}. Allowed types are Excel, Word, JPEG, PNG, GIF.`
      ),
      false
    );
  }
};
const upload = multer({ storage,fileFilter});
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).json(documents);
  } catch (error) {
    logger.error("Error fetching documents", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createDocument = async (req, res) => {
  // -----------------------------------------
  // 1. VALIDATION
  // -----------------------------------------
  if (!req.file) {
    logger.warn("Missing file in request");
    throw createError(400, "File is required");
  }
  if (!req.body || !req.body.type) {
    logger.warn("Missing document type in request");
    throw createError(400, "Document type is required");
  }

  // -----------------------------------------
  // 2. BUILD FILEPATH + BASE DATA
  // -----------------------------------------
  const absoluteFilePath = path.resolve(uploadPath, req.file.filename);
  const originalName =
    req.file.originalname ||
    req.originalname ||
    req.body.name ||
    "uploaded-file";

  let mimeType = req.file.mimetype || req.body.mimeType;

  // -----------------------------------------
  // 3. FIX MIME TYPE FOR PDFs (production bug)
  // -----------------------------------------
  if (!mimeType || mimeType === "application/octet-stream") {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === ".pdf") {
      mimeType = "application/pdf"; // FORCE PDF MIME
    }
  }

  if (!mimeType) {
    mimeType = "application/octet-stream";
  }

  logger.info("Creating a new document", {
    creator: req.body.creator,
    uploadedAt: new Date(),
    originalName,
    filepath: absoluteFilePath,
    type: req.body.type,
    mimeType,
  });

  try {
    const newDocument = new Document({
      creator: req.body.creator,
      uploadedAt: new Date(),
      filename: originalName,
      filepath: absoluteFilePath,
      type: req.body.type,
      mimeType,
      version: 1,
    });

    const savedDocument = await newDocument.save();
    logger.info("Document created successfully", {
      documentId: savedDocument._id,
      filepath: savedDocument.filepath,
      mimeType: savedDocument.mimeType,
    });

    res.status(201).json(savedDocument);
  } catch (error) {
    logger.error("Error saving document", { error: error.message });
    throw createError(500, "Internal server error");
  }
};


export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      logger.warn("Document not found", { documentId: req.params.id });
      throw createError(404, "Document not found");
    }
    res.status(200).json(document);
  } catch (error) {
    logger.error("Error fetching document", { error: error.message });
    throw createError(500, "Internal server error");
  }
};

export const updateDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      logger.warn("Document not found for update", {
        documentId: req.params.id
      });
      throw createError(404, "Document not found");
    }

    document.type = req.body.type || document.type;
    document.version += 1;
    const updatedDocument = await document.save();

    logger.info("Document updated successfully", { documentId: req.params.id });
    res.status(200).json(updatedDocument);
  } catch (error) {
    logger.error("Error updating document", { error: error.message });
    throw createError(500, "Internal server error");
  }
};

export const deleteDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      logger.warn("Document not found for deletion", {
        documentId: req.params.id
      });
      throw createError(404, "Document not found");
    }

    // Use stored filepath if available (prefer absolute path)
    const filePath = document.filepath || path.join(uploadPath, document.filename);
    if (filePath && fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        logger.info("File deleted successfully from filesystem", {
          absoluteFilePath: filePath
        });
      } catch (fsError) {
        logger.error("Error deleting file from filesystem", {
          error: fsError.message,
          absoluteFilePath: filePath
        });
        throw createError(500, "Error deleting file from filesystem");
      }
    }

    await document.deleteOne();
    logger.info("Document deleted successfully from database", {
      documentId: req.params.id
    });

    res.status(200).json({
      message: "Document deleted successfully",
      details: {
        documentId: req.params.id,
        filename: document.filename
      }
    });
  } catch (error) {
    logger.error("Error in delete document operation", {
      error: error.message,
      documentId: req.params.id
    });
    throw createError(500, "Internal server error");
  }
};
export const viewDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      throw createError(404, "Document not found");
    }

    let mime = doc.mimeType;

    // Fix missing MIME when saved incorrectly
    if (!mime || mime === "application/octet-stream") {
      const ext = path.extname(doc.filename).toLowerCase();
      if (ext === ".pdf") {
        mime = "application/pdf";
      }
    }

    res.setHeader("Content-Type", mime || "application/octet-stream");

    const stream = fs.createReadStream(doc.filepath);
    stream.pipe(res);
  } catch (error) {
    logger.error("Error viewing document", { error: error.message });
    throw createError(500, "Internal server error");
  }
};



// Download Document
export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) throw createError(404, "Document not found");

    const filePath = doc.filepath;
    if (!fs.existsSync(filePath)) {
      throw createError(404, "File not found on server");
    }

    // Ensure correct headers for download
    const downloadName = doc.filename || path.basename(filePath);
    if (doc.mimeType) res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        logger.error("Error while sending download", { error: err.message });
        if (!res.headersSent) res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    logger.error("Error downloading document", { error: error.message });
    res.status(error.status || 500).json({ message: error.message });
  }
};