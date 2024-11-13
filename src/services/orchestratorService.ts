import { AzureChatOpenAI } from '@langchain/openai'
import { config } from 'dotenv';

export class OrchestratorService {
    async processMessage(message: string): Promise<string> {

      config();

      const llm = new AzureChatOpenAI({
        model: 'gpt-4o',
        temperature: 0
      })

      const response = await llm.invoke(message);
      
      // AI orchestration logic will go here
      return response.content.toString();
    }
  }