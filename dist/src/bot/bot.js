"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskEsterBot = void 0;
const botbuilder_1 = require("botbuilder");
const orchestrator_1 = require("../services/orchestrator");
class AskEsterBot extends botbuilder_1.ActivityHandler {
    constructor() {
        super();
        this.orchestrator = new orchestrator_1.OrchestratorService();
        this.onMessage(async (context) => {
            const response = await this.orchestrator.processMessage(context.activity.text);
            await context.sendActivity(response);
        });
    }
}
exports.AskEsterBot = AskEsterBot;
