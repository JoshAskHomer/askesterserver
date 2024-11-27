import express from 'express';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import fileUpload from 'express-fileupload';

const router = express.Router();
const knowledgeBaseService = new KnowledgeBaseService();
const tenantId = "c89e7e99-4c97-480c-9b3f-687283aa2dac" //Temporary hardcoded


router.post('/upload', async(req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file uploaded.');
        }
        const file = req.files["files"] as fileUpload.UploadedFile;
        const fileName = file.name;
        const containerId = knowledgeBaseService.getContainerId(tenantId);

        const url = await knowledgeBaseService.uploadFile(file.data, containerId, fileName);
        res.status(200).send({ url });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
})

router.post('/user/:userid/upload', async(req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file uploaded.');
        }

        const file = req.files["files"] as fileUpload.UploadedFile;
        const fileName = file.name;
        const userId = req.params.userid;
        const containerId = knowledgeBaseService.getContainerId(tenantId, userId);

        const url = await knowledgeBaseService.uploadFile(file.data, containerId, fileName);
        res.status(200).send({ url });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
})

router.post('/team/:teamid/upload', async(req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file uploaded.');
        }

        const file = req.files["files"] as fileUpload.UploadedFile;
        const fileName = file.name;
        const teamId = req.params.teamid;
        const containerId = knowledgeBaseService.getContainerId(tenantId, teamId);

        const url = await knowledgeBaseService.uploadFile(file.data, containerId, fileName);
        res.status(200).send({ url });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
});

router.get('/files', async(req, res) => {
    try{
        const containerId = knowledgeBaseService.getContainerId(tenantId);
        const files = await knowledgeBaseService.getFiles(containerId);
        res.status(200).send(files);
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
}); 

router.get('/user/:userid/files', async(req, res) => {
    try{
        const userId = req.params.userid;
        const containerId = knowledgeBaseService.getContainerId(tenantId, userId);
        const files = await knowledgeBaseService.getFiles(containerId);
        res.status(200).send(files);
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
});

router.get('/team/:teamid/files', async(req, res) => {
    try{
        const teamId = req.params.teamid;
        const containerId = knowledgeBaseService.getContainerId(tenantId, teamId);
        const files = await knowledgeBaseService.getFiles(containerId);
        res.status(200).send(files);
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
});

router.get('/file/:filename', async(req, res) => {
    try{
        const containerId = knowledgeBaseService.getContainerId(tenantId);
        const fileName = req.params.filename;
        const file = await knowledgeBaseService.getFile(containerId, fileName);
        res.status(200).send(file);
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while retrieving the file.');
    }
});

router.get('/user/:userid/file/:filename', async(req, res) => {
    try{
        const userId = req.params.userid;
        const containerId = knowledgeBaseService.getContainerId(tenantId, userId);
        const fileName = req.params.filename;
        const file = await knowledgeBaseService.getFile(containerId, fileName);
        res.status(200).send(file);
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while retrieving the file.');
    }
});

router.get('/team/:teamid/file/:filename', async(req, res) => {
    try{
        const teamId = req.params.teamid;
        const containerId = knowledgeBaseService.getContainerId(tenantId, teamId);
        const fileName = req.params.filename;
        const file = await knowledgeBaseService.getFile(containerId, fileName);
        res.status(200).send(file);
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while retrieving the file.');
    }
});

router.post('/file/:filename/startindexing', async(req, res) => {
    try{
        const fileName = req.params.filename;
        const containerId = knowledgeBaseService.getContainerId(tenantId);
        await knowledgeBaseService.startIndexingFile(containerId, fileName, {
            indexName: tenantId
        });
        res.status(202).send({message: 'Document indexing started'});
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while starting the indexing process.');
    }
});

router.post('/user/:userid/:filename/startindexing', async(req, res) => {
    try{
        console.log("estetset");
        const userId = req.params.userid;
        const fileName = req.params.filename;
        const containerId = knowledgeBaseService.getContainerId(tenantId, userId);
        await knowledgeBaseService.startIndexingFile(containerId, fileName, {
            indexName: tenantId,
            category: "personal",
            ownerId: userId
        });
        res.status(202).send({message: 'Document indexing started'});
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while starting the indexing process.');
    }
});

router.post('/team/:teamid/:filename/startindexing', async(req, res) => {
    try{
        const teamId = req.params.teamid;
        const fileName = req.params.filename;
        const containerId = knowledgeBaseService.getContainerId(tenantId, teamId);
        await knowledgeBaseService.startIndexingFile(containerId, fileName, {
            indexName: tenantId,
            category: "team",
            ownerId: teamId
        });
        res.status(202).send({message: 'Document indexing started'});
    }catch(error){
        console.error(error);
        res.status(500).send('An error occurred while starting the indexing process.');
    }
});

export { router as knowledgeBaseRouter };