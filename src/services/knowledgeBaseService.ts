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

    async loadFiles(containerName: string) {
        try {

            console.log("Loading files...")
            const credential = new DefaultAzureCredential();

            const loader = new AzureBlobStorageContainerLoader({
                azureConfig: {
                    connectionString: "DefaultEndpointsProtocol=https;AccountName=askesterstorage;AccountKey=/m5nHZ8QaklLsYcOu1JWjMQUEfvgRa/lHLC/e3sB+ryZ+bRPBTeEzSNkV+C8xQeDppbzl1Zl8kaA+AStro3ymQ==;EndpointSuffix=core.windows.net",
                    container: containerName
                },
                unstructuredConfig: {
                    apiUrl: "https://api.unstructuredapp.io/general/v0/general",
                    apiKey: "L8wioFiZ2NWbvgn4usTbz8ZWjjqyoB"
                }
            });
            console.log("...")
            console.log("...")
            const docs = await loader.load();
            console.log("Loaded");
            console.log(docs);
        } catch (error) {
            console.error('Error loading files:', error);
            throw error;
        }
    }

}