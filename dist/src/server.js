"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const bot_1 = require("./routes/bot");
const orchestrator_1 = require("./routes/orchestrator");
const tab_1 = require("./routes/tab");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const knowledgebase_1 = require("./routes/knowledgebase");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use((0, express_fileupload_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api/messages', bot_1.botRouter);
app.use('/api/orchestrator', orchestrator_1.orchestratorRouter);
app.use('/api/knowledgebase', knowledgebase_1.knowledgeBaseRouter);
// Tab routes
app.use('/tab', tab_1.tabRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
