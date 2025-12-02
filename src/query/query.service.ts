import { Injectable, Logger } from '@nestjs/common';
import { PROMPTS } from '../utils/prompts';
import { BasicQueryDto } from 'src/dto/BasicQuery';
import { initChatModel } from "langchain/chat_models/universal";

import {
    generateText,
    streamText,
} from 'ai';
import { google } from "@ai-sdk/google"


@Injectable()
export class QueryService {

    async basicLangchainQuery(query: BasicQueryDto) {
        try {
            const model = await initChatModel("google-genai:gemini-2.5-flash-lite");
            const prompt = PROMPTS.BASIC_CHAT_TEMPLATE.replace('{input}', query.user_query);
            
            const response = await model.invoke(prompt);
            return response.lc_kwargs.content;
            // return response;
            // Full response object contains more metadata if needed for help with cost anlysis, etc.
        } catch (error) {
            Logger.error('Error processing query, returning fallback result', error?.toString?.(), 'QueryService');
            return { result: `ERROR: You queried for: ${query.user_query}` };
        }
    }

    async basicVercelQuery(query: BasicQueryDto) {
        try {
            const prompt = PROMPTS.BASIC_CHAT_TEMPLATE.replace('{input}', query.user_query);
            const result = await generateText({
                model: google("gemini-2.5-flash"),
                prompt,
            });
            return result.text;
        } catch (error) {
            Logger.error('Error processing query, returning fallback result', error?.toString?.(), 'QueryService');
            return { result: `ERROR: You queried for: ${query.user_query}` };
        }
    }

    streamVercelQuery(query: BasicQueryDto) {
        try {
            const prompt = PROMPTS.BASIC_CHAT_TEMPLATE.replace('{input}', query.user_query);
            const result = streamText({
                model: google("gemini-2.5-flash"),
                prompt,
            });
            return result;
        } catch (error) {
            Logger.error('Error processing query, returning fallback result', error?.toString?.(), 'QueryService');
            return { result: `ERROR: You queried for: ${query.user_query}` };
        }
    }

}