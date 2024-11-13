"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const openai_1 = require("@langchain/openai");
const dotenv_1 = require("dotenv");
class OrchestratorService {
    async processMessage(message) {
        (0, dotenv_1.config)();
        const llm = new openai_1.AzureChatOpenAI({
            model: 'gpt-4o',
            temperature: 0
        });
        const response = await llm.invoke(message);
        // AI orchestration logic will go here
        return response.content.toString();
    }
}
exports.OrchestratorService = OrchestratorService;
