"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botRouter = void 0;
const express_1 = __importDefault(require("express"));
const botbuilder_1 = require("botbuilder");
const bot_1 = require("../bot/bot");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const authentication = new botbuilder_1.ConfigurationBotFrameworkAuthentication(process.env);
const adapter = new botbuilder_1.CloudAdapter(authentication);
console.log("Bot Adapter Initialized\n");
console.log(process.env.MicrosoftAppId + "\n");
console.log(process.env.MicrosoftAppPassword + "\n");
const bot = new bot_1.AskEsterBot();
const router = express_1.default.Router();
exports.botRouter = router;
router.post('/', (req, res) => {
    adapter.process(req, res, async (context) => {
        await bot.run(context);
    });
});
