"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseService = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
const azure_blob_storage_file_1 = require("@langchain/community/document_loaders/web/azure_blob_storage_file");
const dotenv_1 = require("dotenv");
const search_documents_1 = require("@azure/search-documents");
const indexDefinition_1 = require("./indexDefinition");
(0, dotenv_1.config)();
class KnowledgeBaseService {
    async uploadPersonal(file, fileName) {
        const credential = new identity_1.DefaultAzureCredential();
        const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://askesterstorage.blob.core.windows.net`, credential);
        const containerClient = blobServiceClient.getContainerClient('askhomerai-personal-joshaskhomerai');
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.uploadData(file);
        return blockBlobClient.url;
    }
    async listFiles(containerName) {
        const credential = new identity_1.DefaultAzureCredential();
        const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://askesterstorage.blob.core.windows.net`, credential);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const files = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            const size = this.formatSize(blob.properties.contentLength || 0);
            const uploadDate = blob.properties.lastModified?.toLocaleDateString() || '';
            files.push({
                name: blob.name,
                uploaddate: uploadDate,
                size: size
            });
        }
        return files;
    }
    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0)
            return '0 Byte';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
    async indexPersonalDocument(fileName, userEmail, organizationName) {
        (0, dotenv_1.config)();
        const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '');
        const containerName = `${organizationName}-personal-${sanitizedEmail}`;
        //Load file from Azure Blob Storage
        const documents = this.loadBlobStorageFile(fileName, containerName);
        console.log("Documents loaded from blob storage");
        //Create index if doesn't exist
        const credential = new identity_1.DefaultAzureCredential();
        const indexClient = new search_documents_1.SearchIndexClient("https://askester-search.search.windows.net", credential);
        console.log("Creating index");
        //Create index if doesn't exist
        let index;
        try {
            index = await indexClient.getIndex("test");
            console.log("Index exists");
        }
        catch (error) {
            console.log("---");
            console.log(error);
            //if(error.statusCode === 404 || error.code === 403){
            index = await indexClient.createIndex({
                name: organizationName,
                ...indexDefinition_1.indexDefinition
            });
            console.log("Index created");
            //}
        }
    }
    async loadBlobStorageFile(fileName, containerName) {
        const loader = new azure_blob_storage_file_1.AzureBlobStorageFileLoader({
            azureConfig: {
                blobName: fileName,
                container: containerName,
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
}
exports.KnowledgeBaseService = KnowledgeBaseService;
