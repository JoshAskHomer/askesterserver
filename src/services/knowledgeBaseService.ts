import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { AzureBlobStorageFileLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_file";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AzureAISearchVectorStore, AzureAISearchQueryType } from "@langchain/community/vectorstores/azure_aisearch";
import { config } from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SearchIndex, SearchIndexClient } from "@azure/search-documents";
import { indexDefinition } from "./indexDefinition";

config();

export class KnowledgeBaseService {
    
    public async uploadPersonal(file: Buffer, fileName: string): Promise<string> {

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

    public async listFiles(containerName: string): Promise<{ name: string, uploaddate: string, size: string }[]> {
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

    public async indexPersonalDocument(fileName: string, userEmail: string, organizationName: string){

        config();
        const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '');
        const containerName = `${organizationName}-personal-${sanitizedEmail}`;

        //Load file from Azure Blob Storage
        const documents = this.loadBlobStorageFile(fileName, containerName);
        console.log("Documents loaded from blob storage");

        //Create index if doesn't exist
        const credential = new DefaultAzureCredential();
        const indexClient = new SearchIndexClient("https://askester-search.search.windows.net", credential);

        console.log("Creating index");
        //Create index if doesn't exist
        let index: SearchIndex;
        try{
            index = await indexClient.getIndex("test");
            console.log("Index exists");
        }catch(error: any){
            console.log("---");
            console.log(error);
            //if(error.statusCode === 404 || error.code === 403){
                index = await indexClient.createIndex({
                    name: organizationName,
                    ...indexDefinition
                });
                console.log("Index created");
            //}
        }
    }

    private async loadBlobStorageFile(fileName: string, containerName: string){
        const loader = new AzureBlobStorageFileLoader({
            azureConfig: {
                blobName: fileName,
                container: containerName,
                connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING as string
            },
            unstructuredConfig: {
                apiKey: process.env.UNSTRUCTURED_API_KEY as string,
                apiUrl: process.env.UNSTRUCTURED_API_URL as string
            }
        });

        const documents = await loader.load();
        return documents;
    }

}