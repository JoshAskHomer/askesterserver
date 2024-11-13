import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { AzureBlobStorageContainerLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_container";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { config } from "dotenv";


config();

export class KnowledgeBaseService {
    
    async uploadPersonal(file: Buffer, fileName: string): Promise<string> {

        const credential = new DefaultAzureCredential();
        const blobServiceClient = new BlobServiceClient(
            `https://askesterstorage.blob.core.windows.net`,
            credential
        );
        const containerClient = blobServiceClient.getContainerClient('askhomerai-personal-joshaskhomerai');
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        await blockBlobClient.uploadData(file);

        return blockBlobClient.url;
    }

    async listFiles(containerName: string): Promise<{ name: string, uploaddate: string, size: string }[]> {
        const credential = new DefaultAzureCredential();
        const blobServiceClient = new BlobServiceClient(
            `https://askesterstorage.blob.core.windows.net`,
            credential
        );
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const files: { name: string, uploaddate: string, size: string }[] = [];
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

    private formatSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }

    

}