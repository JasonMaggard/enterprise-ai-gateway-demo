import { Injectable, Logger } from '@nestjs/common';
import { PROMPTS } from '../utils/prompts';
import { BasicQueryDto } from 'src/dto/BasicQuery';
import { initChatModel } from "langchain/chat_models/universal";



@Injectable()
export class QueryService {

    async basicQuery(query: BasicQueryDto) {
        try {
            const model = await initChatModel("google-genai:gemini-2.5-flash-lite");
            const prompt = PROMPTS.BASIC_CHAT_TEMPLATE.replace('{input}', query.user_query);
            
            const response = await model.invoke(prompt);
            return response.lc_kwargs.content;
        } catch (error) {
            Logger.error('Error processing query, returning fallback result', error?.toString?.(), 'QueryService');
            return { result: `ERROR: You queried for: ${query.user_query}` };
        }
    }

}