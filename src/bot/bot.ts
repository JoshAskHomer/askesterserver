import { ActivityHandler, TurnContext } from 'botbuilder';
import { OrchestratorService } from '../services/orchestrator';

export class AskEsterBot extends ActivityHandler {
  private orchestrator: OrchestratorService;

  constructor() {
    super();
    this.orchestrator = new OrchestratorService();

    this.onMessage(async (context: TurnContext) => {
      const response = await this.orchestrator.processMessage(context.activity.text);
      await context.sendActivity(response);
    });
  }
}