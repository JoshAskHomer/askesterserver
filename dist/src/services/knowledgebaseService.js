"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseService = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const crypto = __importStar(require("crypto"));
const identity_1 = require("@azure/identity");
const azure_blob_storage_file_1 = require("@langchain/community/document_loaders/web/azure_blob_storage_file");
const text_splitter_1 = require("langchain/text_splitter");
const azure_aisearch_1 = require("@langchain/community/vectorstores/azure_aisearch");
const dotenv_1 = require("dotenv");
const openai_1 = require("@langchain/openai");
const search_documents_1 = require("@azure/search-documents");
const indexDefinition_1 = require("./indexDefinition");
const node_cache_1 = __importDefault(require("node-cache"));
(0, dotenv_1.config)();
class KnowledgeBaseService {
    constructor() {
        this.indexingStatusCache = new node_cache_1.default({ stdTTL: 3600 }); // 1 hour TTL
        const credential = new identity_1.DefaultAzureCredential();
        this.blobServiceClient = new storage_blob_1.BlobServiceClient(process.env.BLOB_URL, credential);
    }
    getContainerId(tenantId, userOrTeamId) {
        const combinedId = tenantId + userOrTeamId;
        const hash = (input) => crypto.createHash('sha256').update(input).digest('hex').slice(0, 60);
        return hash(combinedId);
    }
    async uploadFile(file, containerId, fileName) {
        const metadata = {
            status: "uploaded",
            isIndexed: "false"
        };
        try {
            const containerClient = this.blobServiceClient.getContainerClient(containerId);
            const blobClient = containerClient.getBlockBlobClient(fileName);
            await blobClient.uploadData(file, { metadata });
            return blobClient.url;
        }
        catch (error) {
            if (error.code === "ContainerNotFound") {
                const container = await this.blobServiceClient.createContainer(containerId);
                const containerClient = container.containerClient;
                const blobClient = containerClient.getBlockBlobClient(fileName);
                await blobClient.uploadData(file, { metadata });
                return blobClient.url;
            }
            throw error;
        }
    }
    async getFiles(containerId) {
        const files = [];
        try {
            const containerClient = this.blobServiceClient.getContainerClient(containerId);
            for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
                const size = this.formatSize(blob.properties.contentLength || 0);
                const uploadDate = blob.properties.lastModified?.toLocaleDateString() || '';
                files.push({
                    name: blob.name,
                    uploadDate: uploadDate,
                    size: size,
                    status: blob.metadata?.status || "unknown",
                    isIndexed: blob.metadata?.isIndexed === "true",
                    lastIndexed: blob.metadata?.lastIndexed || ""
                });
            }
        }
        catch (error) {
            if (error.code === "ContainerNotFound") {
                return [];
            }
            throw error;
        }
        return files;
    }
    async getFile(containerId, fileName) {
        const containerClient = this.blobServiceClient.getContainerClient(containerId);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        const blob = await blobClient.getProperties();
        const size = this.formatSize(blob.contentLength || 0);
        const uploadDate = blob.lastModified?.toLocaleDateString() || '';
        return {
            name: fileName,
            uploadDate: uploadDate,
            size: size,
            status: blob.metadata?.status || "unknown",
            isIndexed: blob.metadata?.isIndexed === "true",
            lastIndexed: blob.metadata?.lastIndexed || ""
        };
    }
    async startIndexingFile(containerId, fileName, options) {
        //Update file metadata
        await this.updateFileMetadata(containerId, fileName, { status: "indexing" });
        const startIndexing = async () => {
            //Load file from Azure Blob Storage
            const documents = await this.loadBlobStorageFile(fileName, containerId);
            //Create index if doesn't exist
            const credential = new search_documents_1.AzureKeyCredential(process.env.AZURE_AISEARCH_KEY);
            const indexClient = new search_documents_1.SearchIndexClient(process.env.AZURE_AISEARCH_ENDPOINT, credential);
            //Create index if doesn't exist
            try {
                await indexClient.getIndex(options.indexName);
            }
            catch (error) {
                if (error.statusCode === 404 || error.code === 403) {
                    await indexClient.createIndex({
                        name: options.indexName,
                        ...indexDefinition_1.indexDefinition
                    });
                }
            }
            //Split docs
            const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 500
            });
            let splitDocs = await splitter.splitDocuments(documents);
            splitDocs.forEach(doc => doc.metadata.category = "personal");
            //Tag docs
            const taggedDocs = documents.map(doc => {
                if (options.category && options.ownerId) {
                    doc.metadata.attributes = [
                        { key: "category", value: options.category },
                        { key: "ownerId", value: options.ownerId }
                    ];
                }
                return doc;
            });
            //Index documents
            await azure_aisearch_1.AzureAISearchVectorStore.fromDocuments(taggedDocs, new openai_1.OpenAIEmbeddings(), {
                indexName: options.indexName
            });
        };
        startIndexing().then(async () => {
            await this.updateFileMetadata(containerId, fileName, { status: "indexed", isIndexed: "true", lastIndexed: new Date().toISOString() });
        }).catch(async (error) => {
            await this.updateFileMetadata(containerId, fileName, { status: "index_failed", isIndexed: "false" });
        });
    }
    async updateFileMetadata(containerId, fileName, metadata) {
        const containerClient = this.blobServiceClient.getContainerClient(containerId);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        await blobClient.setMetadata({ ...metadata });
    }
    async loadBlobStorageFile(fileName, containerId) {
        const loader = new azure_blob_storage_file_1.AzureBlobStorageFileLoader({
            azureConfig: {
                blobName: fileName,
                container: containerId,
                connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING
            },
            unstructuredConfig: {
                apiKey: process.env.UNSTRUCTURED_API_KEY,
                apiUrl: process.env.UNSTRUCTURED_API_URL
            }
        });
        const documents = await loader.load();
        return documents;
    }
    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '0 Byte';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.KnowledgeBaseService = KnowledgeBaseService;
