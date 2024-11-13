"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseService = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const identity_1 = require("@azure/identity");
const dotenv_1 = require("dotenv");
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
}
exports.KnowledgeBaseService = KnowledgeBaseService;
