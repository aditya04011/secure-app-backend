// services/search.service.js
import elasticsearchClient from "../../../services/elasticsearch.service.js";

export const searchInElasticsearch = async (query, type) => {
  let index, fields;

  // Determine index and fields to search based on the type
  if (type === "projects") {
    index = "projects";
    fields = [
      "title",
      "description",
      "owner",
      "assignee",
      "branch",
      "task.title",
      "task.description",
      "notes.note"
    ];
  } else if (type === "users") {
    index = "users";
    fields = [
      "fullname",
      "username",
      "email",
      "phoneNumber",
      "designation",
      "role",
      "branch"
    ];
  } else {
    throw new Error("Invalid type parameter. Use 'projects' or 'users'.");
  }

  const results = await elasticsearchClient.search({
    index,
    body: {
      query: {
        multi_match: {
          query,
          fields
        }
      }
    }
  });

  return results.hits.hits;
};
