import { SearchIndex } from "@azure/search-documents";
import { CreateContextOptions } from "vm";

export const indexDefinition: SearchIndex | any = {
  "fields": [
    {
      "name": "id",
      "type": "Edm.String",
      "searchable": false,
      "filterable": true,
      "stored": true,
      "sortable": false,
      "facetable": false,
      "key": true
    },
    {
      "name": "content",
      "type": "Edm.String",
      "searchable": true,
      "filterable": true,
      "stored": true,
      "sortable": false,
      "facetable": false,
      "key": false
    },
    {
      "name": "content_vector",
      "type": "Collection(Edm.Single)",
      "searchable": true,
      "filterable": false,
      "stored": true,
      "sortable": false,
      "facetable": false,
      "key": false
    },
    {
      "name": "metadata",
      "type": "Edm.ComplexType",
      "fields": [
        {
          "name": "source",
          "type": "Edm.String",
          "searchable": false,
          "filterable": true,
          "stored": true,
          "sortable": false,
          "facetable": false,
          "key": false
        },
        {
          "name": "attributes",
          "type": "Collection(Edm.ComplexType)",
          "fields": [
            {
              "name": "key",
              "type": "Edm.String",
              "searchable": false,
              "filterable": true,
              "stored": true,
              "sortable": false,
              "facetable": false,
              "key": false
            },
            {
              "name": "value",
              "type": "Edm.String",
              "searchable": false,
              "filterable": true,
              "stored": true,
              "sortable": false,
              "facetable": false,
              "key": false
            }
          ]
        }
      ]
    }
  ],
  "scoringProfiles": [],
  "suggesters": [],
  "analyzers": [],
  "tokenizers": [],
  "tokenFilters": [],
  "charFilters": [],
  "similarity": {
    odatatype: "#Microsoft.Azure.Search.BM25Similarity"
  },
  semanticSearch: {
    "defaultConfigurationName": "semantic-search-config",
    "configurations": [
      {
        "name": "semantic-search-config",
        "prioritizedFields": {
          "contentFields": [
            {
              "name": "content"
            }
          ],
          "keywordsFields": [
            {
              "name": "content"
            }
          ]
        }
      }
    ]
  },
  "vectorSearch": {
    "algorithms": [
      {
        "name": "vector-search-algorithm",
        "kind": "hnsw",
        parameters: {
          "metric": "cosine",
          "m": 4,
          "efConstruction": 400,
          "efSearch": 500
        }
      }
    ],
    "profiles": [
      {
        "name": "vector-search-profile",
        algorithmConfigurationName: "vector-search-algorithm"
      }
    ],
    "vectorizers": [],
    "compressions": []
  }
}