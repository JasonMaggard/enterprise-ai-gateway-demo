import { Controller, Get, Post, Param, Query, Res, Body } from '@nestjs/common';
import {
    createUIMessageStream,
    pipeUIMessageStreamToResponse,
} from 'ai';
import { QueryService } from './query.service';
import type { Response } from 'express';

@Controller('query')
export class QueryController {
    constructor(private readonly queryService: QueryService) { }

    // Accepts a path parameter: GET /query/<queryString>
    @Get(':queryString')
    async runQueryPath(@Param('queryString') queryString: string): Promise<any> {
        return this.langchainQuery(queryString);
    }

    // Accepts a query parameter: GET /query?q=<queryString>
    @Get()
    async runQueryParam(@Query('q') q?: string): Promise<any> {
        if (!q) {
            return { result: null, message: 'no query provided' };
        }
        return this.langchainQuery(q);
    }

    private async langchainQuery(queryString: string) {
        // run the service's basicQuery flow and return its response
        const res = await this.queryService.basicLangchainQuery({ user_query: queryString });
        return res;
    }


    @Post('/')
    async basicPost(@Res() res: Response, @Body('q') q?: string) {
        if (!q) {
            return res.json({ result: null, message: 'no query provided' });
        }
        
        const result = await this.queryService.basicVercelQuery({ user_query: q });
        return res.send(result);
    }

    @Post('/stream-text')
    async streamPost(@Res() res: Response, @Body('q') q?: string) {
        if (!q) {
            return res.json({ result: null, message: 'no query provided' });
        }
        
        const result = this.queryService.streamVercelQuery({ user_query: q });
        
        if (this.isStream(result) === false) {
            return res.json(result);
        }

        const stream = createUIMessageStream({
            execute: ({ writer }) => {
                writer.merge(
                    (result as any).toUIMessageStream({
                        sendStart: true,
                    }),
                );
            }
        });

        pipeUIMessageStreamToResponse({ stream, response: res });
    }

    @Post('/stream-data')
    async streamData(@Res() response: Response, @Body('q') q?: string) {
        // Create a stream with custom data and headers
        if (!q) {
            return response.json({ result: null, message: 'no query provided' });
        }
        
        const stream = createUIMessageStream({
            execute: ({ writer }) => {
                // write some data
                writer.write({ type: 'start' });
                
                const timestamp = new Date();
                writer.write({
                    type: 'data-custom',
                    data: {
                        custom: `New Query received at ${timestamp.toLocaleString()}`,
                    },
                });

                const result = this.queryService.streamVercelQuery({ user_query: q });
        
                if (this.isStream(result) === false) {
                    writer.write({
                        type: 'data-custom',
                        data: {
                            custom: result,
                        },
                    });
                    writer.write({ type: 'finish' });
                } else {
                    writer.merge(
                        (result as any).toUIMessageStream({
                            sendStart: false,
                            onError: (error) => {
                                // If you want to expose the error message to the client, you can do so here:
                                return error instanceof Error ? error.message : String(error);
                            },
                        }),
                    );
                }
            },
        });
        pipeUIMessageStreamToResponse({ stream, response });
    }

    private isStream(obj: any): boolean {
        return typeof obj === 'object' ||
            typeof (obj as any).toUIMessageStream === 'function'
    }
}
