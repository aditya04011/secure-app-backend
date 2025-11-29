import { Client } from "@elastic/elasticsearch";
import { constants } from "../utils/constants.utils.js";

const elasticNode = `http://${constants.elasticsearch.host}:${constants.elasticsearch.port}`;

const elasticsearchClient = new Client({
  node: elasticNode,
  auth: {
    username: constants.elasticsearch.username,
    password: constants.elasticsearch.password
  }
});

export default elasticsearchClient;
