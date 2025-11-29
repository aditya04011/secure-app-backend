import elasticsearchClient from "../services/elasticsearch.service.js";
import User from "../core/security/models/user.model.js";
import Project from "../modules/taskmanagement/models/project.model.js";
import loggerService from "../services/logging.service.js";

// Logger
const logger = loggerService.getModuleLogger("Global-Utils","Elasticsearch Indexing");

// Index data into Elasticsearch
const indexData = async (index, data) => {
  try {
    const { _id, ...body } = data.toObject(); // Convert Mongoose document to plain object and exclude _id
    await elasticsearchClient.index({
      index,
      id: _id.toString(), // Use the _id field as the document ID
      body
    });
    logger.info(`Indexed data in ${index}: ${_id}`);
  } catch (err) {
    logger.error("Error indexing data:", err);
  }
};

// Sync data from MongoDB to Elasticsearch for all the modules of isc
const indexingDataForElasticSearch = async () => {
  try {
    // Sync Users
    const users = await User.find({});
    users.forEach((user) => {
      indexData("users", user);
    });

    // Sync Projects
    const projects = await Project.find({});
    projects.forEach((project) => {
      indexData("projects", project);
    });
  } catch (err) {
    logger.error("Error syncing data:", err);
  }
};

export default indexingDataForElasticSearch;
