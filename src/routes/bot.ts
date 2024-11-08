import express from 'express';
import { CloudAdapter, ConfigurationBotFrameworkAuthentication } from 'botbuilder';
import { AskEsterBot } from '../bot/bot';
import { config } from 'dotenv';

config();

const authentication = new ConfigurationBotFrameworkAuthentication(process.env as any);
const adapter = new CloudAdapter(authentication);

console.log("Bot Adapter Initialized\n");
console.log(process.env.MicrosoftAppId + "\n");
console.log(process.env.MicrosoftAppPassword + "\n");

const bot = new AskEsterBot();
const router = express.Router();

router.post('/', (req, res) => {
  adapter.process(req, res, async (context) => {
    await bot.run(context);
  });
});

export { router as botRouter };