/*
import { searchInElasticsearch } from "../services/search.service.js";

export const search = async (req, res) => {
  const { query, type } = req.query;

  if (!query) {
    return res.status(400).send("Query parameter is required.");
  }

  try {
    const results = await searchInElasticsearch(query, type);
    res.json(results);
  } catch (err) {
    console.error(err);
    if (err.message.includes("Invalid type parameter")) {
      return res.status(400).send(err.message);
    }
    res.status(500).send("Error searching data");
  }
};

*/

import { searchInElasticsearch } from "../services/search.service.js";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Search","SearchController");

export const search = async (req, res, next) => {
  const { query, type } = req.query;

  // Log the search request
  logger.info("Search request received", { query, type });

  // Check if the query parameter is provided
  if (!query) {
    logger.warn("Query parameter is missing");
    return next(createError(400, "Query parameter is required."));
  }

  try {
    // Perform the search in Elasticsearch
    const results = await searchInElasticsearch(query, type);
    logger.info("Search completed successfully", { query, type, resultsCount: results.length });
    res.status(200).json(results);
  } catch (err) {
    logger.error("Error during search", { error: err.message });

    // Handle specific errors
    if (err.message.includes("Invalid type parameter")) {
      logger.warn("Invalid type parameter", { type });
      return next(createError(400, err.message));
    }

    // Handle generic errors
    next(createError(500, "Error searching data"));
  }
};
