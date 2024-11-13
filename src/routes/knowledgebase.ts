import express from 'express';
import { OrchestratorService } from '../services/orchestratorService';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import fileUpload from 'express-fileupload';

const router = express.Router();
const knowledgeBaseService = new KnowledgeBaseService();

router.post('/upload/personal', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file uploaded.');
        }

        const file = req.files["files"] as fileUpload.UploadedFile;
        const fileName = file.name;

        const url = await knowledgeBaseService.uploadPersonal(file.data, fileName);
        res.status(200).send({ url });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
});

router.get('/files/:containerName', async (req, res) => {
    try {
        const containerName = req.params.containerName;
        const files = await knowledgeBaseService.listFiles(containerName);
        res.status(200).send(files);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
});


export { router as knowledgeBaseRouter };