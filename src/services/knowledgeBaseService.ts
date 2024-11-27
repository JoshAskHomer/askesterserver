import { BlobServiceClient } from "@azure/storage-blob";
import * as crypto from 'crypto';
import { DefaultAzureCredential } from "@azure/identity";
import { AzureBlobStorageFileLoader } from "@langchain/community/document_loaders/web/azure_blob_storage_file";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AzureAISearchVectorStore } from "@langchain/community/vectorstores/azure_aisearch";
import { config } from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import { AzureKeyCredential, SearchIndexClient } from "@azure/search-documents";
import { indexDefinition } from "./indexDefinition";
import { BlobFile, BlobFileMetadata } from '../../../types/askester';
import NodeCache from "node-cache";

config();

export class KnowledgeBaseService {

    private indexingStatusCache: NodeCache; 
    private blobServiceClient: BlobServiceClient;

    constructor() {
        this.indexingStatusCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

        const credential = new DefaultAzureCredential();
        this.blobServiceClient = new BlobServiceClient(
            process.env.BLOB_URL as string,
            credential
        );
    }

    public getContainerId(tenantId: string, userOrTeamId?: string): string {
        const combinedId = tenantId + userOrTeamId;
        const hash = (input: string) => crypto.createHash('sha256').update(input).digest('hex').slice(0, 60);
        return hash(combinedId);
    }

    public async uploadFile(file: Buffer, containerId: string, fileName: string): Promise<string> {
        
        const metadata = {
            status: "uploaded",
            isIndexed: "false"
        }
        
        try{
            const containerClient = this.blobServiceClient.getContainerClient(containerId);
            const blobClient = containerClient.getBlockBlobClient(fileName);
            await blobClient.uploadData(file, {metadata});
            return blobClient.url;
        }catch(error: any){
            if(error.code === "ContainerNotFound"){
                const container = await this.blobServiceClient.createContainer(containerId);
                const containerClient = container.containerClient;
                const blobClient = containerClient.getBlockBlobClient(fileName);
                await blobClient.uploadData(file, {metadata});
                return blobClient.url;
            }
            throw error;
        }
    }

    public async getFiles(containerId: string): Promise<BlobFile[]>{
        const files: BlobFile[] = [];
        
        try{
            const containerClient = this.blobServiceClient.getContainerClient(containerId);
            for await (const blob of containerClient.listBlobsFlat({includeMetadata: true})) {
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
        }catch(error: any){
            if(error.code === "ContainerNotFound"){
                return [];
            }
            throw error;
        }

        return files;
    }

    public async getFile(containerId: string, fileName: string): Promise<BlobFile>{
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
        }
    }

    public async startIndexingFile(containerId: string, fileName: string, options: {indexName: string, category?: "personal" | "team", ownerId?: string}){

        //Update file metadata
        await this.updateFileMetadata(containerId, fileName, {status: "indexing"})
        
        const startIndexing = async () => {
            //Load file from Azure Blob Storage
            const documents = await this.loadBlobStorageFile(fileName, containerId);

            //Create index if doesn't exist
            const credential = new AzureKeyCredential(process.env.AZURE_AISEARCH_KEY as string);
            const indexClient = new SearchIndexClient(process.env.AZURE_AISEARCH_ENDPOINT as string, credential);

            //Create index if doesn't exist
            try{
                await indexClient.getIndex(options.indexName);
            }catch(error: any){
                if(error.statusCode === 404 || error.code === 403){
                    await indexClient.createIndex({
                        name: options.indexName,
                        ...indexDefinition
                    });
                }
            }

            //Split docs
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 500
            })
            let splitDocs = await splitter.splitDocuments(documents);
            splitDocs.forEach(doc => doc.metadata.category = "personal");

            //Tag docs
            const taggedDocs = documents.map(doc => {
                if(options.category && options.ownerId){
                    doc.metadata.attributes = [
                        {key: "category", value: options.category},
                        {key: "ownerId", value: options.ownerId}
                    ]
                }
                return doc
            });

            //Index documents
            await AzureAISearchVectorStore.fromDocuments(taggedDocs, new OpenAIEmbeddings(), {
                indexName: options.indexName
            })
        }

        startIndexing().then(async () => {
            await this.updateFileMetadata(containerId, fileName, {status: "indexed", isIndexed: "true", lastIndexed: new Date().toISOString()});
        }).catch(async (error) => {
            await this.updateFileMetadata(containerId, fileName, {status: "index_failed", isIndexed: "false"});
        });
    }

    private async updateFileMetadata(containerId: string, fileName: string, metadata: BlobFileMetadata){
        const containerClient = this.blobServiceClient.getContainerClient(containerId);
        const blobClient = containerClient.getBlockBlobClient(fileName);
        await blobClient.setMetadata({...metadata});
    }

    private async loadBlobStorageFile(fileName: string, containerId: string){
        const loader = new AzureBlobStorageFileLoader({
            azureConfig: {
                blobName: fileName,
                container: containerId,
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

    private formatSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
}