import express from "express";
const router = express.Router();
import loggingService from "../../../services/logging.service.js";
import axios from "axios";

// const logger = loggingService.getModuleLogger("Client Error");

router.post("/info", (req, res) => {
  const { time, message, data, source, module, clientStack, userId, _formatAsJson } = req.body;
  
  // Get a logger specifically for client info logs
  const infoLogger = loggingService.getModuleLogger(module, source, "client", clientStack);
  
  // Prepare log data
  const logData = {
    time,
    data,
    userId,
    source, // Component or module that generated the info
    type: "Client Info", // Crucial for filtering
  };

  // Add formatting flag if present
  if (_formatAsJson) {
    logData._formatAsJson = true;
  }
  
  // Log the info with consistent structure and type
  infoLogger.info(message, logData);
  
  res.status(200).json({ message: "Info logged successfully" });
});

router.post("/error", (req, res) => {
  const { time, errorMessage, message, stack, module, source, componentStack, clientStack, userId, _formatAsJson } = req.body;

  const errorLogger = loggingService.getModuleLogger(module, source, "client", clientStack);
  
  // Prepare log data
  const logData = {
    time,
    error: errorMessage,
    stack,
    userId,
    componentStack: componentStack, // Include component stack
    type: "Client Error" // Crucial for filtering
  };

  // Add formatting flag if present
  if (_formatAsJson) {
    logData._formatAsJson = true;
  }
  
  // Log the error with consistent structure and type
  errorLogger.error(message, logData);

  res.status(200).json({ message: "Error logged successfully" });
});

router.post("/debug", (req, res) => {
  const { time, message, data, source, module, clientStack, userId, _formatAsJson, logLevel } = req.body;
  
  // Get a logger specifically for client debug logs
  const debugLogger = loggingService.getModuleLogger(module, source, "client", clientStack);
  
  // Prepare log data
  const logData = {
    time,
    data,
    userId,
    source, // Component or module that generated the debug log
    type: "Client Debug", // Crucial for filtering
    logLevel: logLevel || 'debug'
  };

  // Add formatting flag if present
  if (_formatAsJson) {
    logData._formatAsJson = true;
  }
  
  // Log the debug info with consistent structure and type
  debugLogger.debug(message, logData);
  
  res.status(200).json({ message: "Debug logged successfully" });
});

router.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon query parameter" });
  }

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "json"
      },
      headers: {
        "User-Agent": "YourAppName/1.0"
      },
      timeout: 10000 // optional, fail if response takes too long
    });

    // Only return the display_name to the client
    const display_name = response.data?.display_name || null;

    res.json(response);
  } catch (error) {
    console.error("Reverse geocoding error:", error.message || error);
    res.status(500).json({ error: "Reverse geocoding failed" });
  }
});

export default {
  path: "/api/modules/client",
  router
};
