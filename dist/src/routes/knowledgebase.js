"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeBaseRouter = void 0;
const express_1 = __importDefault(require("express"));
const knowledgeBaseService_1 = require("../services/knowledgeBaseService");
const router = express_1.default.Router();
exports.knowledgeBaseRouter = router;
const knowledgeBaseService = new knowledgeBaseService_1.KnowledgeBaseService();
router.post('/upload/personal', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No file uploaded.');
        }
        const file = req.files["files"];
        const fileName = file.name;
        const url = await knowledgeBaseService.uploadPersonal(file.data, fileName);
        res.status(200).send({ url });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
});
router.get('/files/:containerName', async (req, res) => {
    try {
        const containerName = req.params.containerName;
        const files = await knowledgeBaseService.listFiles(containerName);
        res.status(200).send(files);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
});
