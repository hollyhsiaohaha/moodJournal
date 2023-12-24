import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';

const { ELASTIC_SEARCH_ENABLED, ELASTIC_USER, ELASTIC_PASSWORD } = process.env;

export const elasticClient = new Client({
  node: 'https://localhost:9200/',
  auth: {
    username: ELASTIC_USER,
    password: ELASTIC_PASSWORD,
  },
  tls: {
    ca: fs.readFileSync('./elastic_http_ca.crt'),
    rejectUnauthorized: false,
  },
});

Number(ELASTIC_SEARCH_ENABLED)
  ? elasticClient
      .ping()
      .then((res) => console.log('Elastic Search connection success: ', res))
      .catch((err) => console.error('Elastic Search wrong connection: ', err))
  : null;

export const checkIndexExist = async (userId) => {
  const indexName = `${userId}-autocomplete`;
  const indexExists = await elasticClient.indices.exists({ index: indexName });
  return indexExists;
};

export async function insertElasticSearch(userId, journals) {
  const indexName = `${userId}-autocomplete`;
  await elasticClient.indices.create(
    {
      index: indexName,
      body: {
        mappings: {
          properties: {
            id: { type: 'text' },
            title: { type: 'text' },
            suggest: { type: 'completion' },
          },
        },
      },
    },
    { ignore: [400] },
  );

  const dataset = [];
  for (let i = 0; i < journals.length; i++) {
    const data = {
      id: journals[i]._id,
      title: journals[i].title,
      suggest: { input: [journals[i].title] },
    };
    dataset.push(data);
  }
  const operations = dataset.flatMap((doc) => [{ index: { _index: indexName } }, doc]);
  const bulkResponse = await elasticClient.bulk({ refresh: true, operations });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: operations[i * 2],
          document: operations[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }
  const count = await elasticClient.count({ index: indexName });
  console.log(count);
}

export const autoCompleteElasticSearch = async (userId, prefix) => {
  const indexName = `${userId}-autocomplete`;
  const document = await elasticClient.search({
    index: indexName,
    body: {
      suggest: {
        suggestions: {
          prefix: prefix,
          completion: { field: 'suggest' },
        },
      },
    },
  });
  const result = document.suggest['suggestions'][0]['options'];
  const parsedRes = result.map((suggest) => suggest._source);
  return parsedRes;
};

export const deleteIndex = async (userId) => {
  const indexName = `${userId}-autocomplete`;
  const isIndexExist = await elasticClient.indices.exists({ index: indexName });
  console.log('isIndexExist', isIndexExist);
  if (isIndexExist) {
    await elasticClient.indices.delete({ index: indexName });
    console.log(`${indexName} deleted`);
    return 1;
  } else return 0;
};

// const journals = [
//   { _id: 'bbb', title: '測試' },
//   { _id: 'ccc', title: '測試2' },
// ];

// insertElasticSearch('aaa', journals);
// deleteIndex('aaa');
// const res = await autoCompleteElasticSearch('aaa', '測');
