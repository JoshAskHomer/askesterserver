"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestratorRouter = void 0;
const express_1 = __importDefault(require("express"));
const orchestratorService_1 = require("../services/orchestratorService");
const router = express_1.default.Router();
exports.orchestratorRouter = router;
const orchestrator = new orchestratorService_1.OrchestratorService();
router.post('/process', async (req, res) => {
    const { message } = req.body;
    const response = await orchestrator.processMessage(message);
    res.json({ response });
});
