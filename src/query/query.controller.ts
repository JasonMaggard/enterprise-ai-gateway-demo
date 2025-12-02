import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryService } from './query.service';

@Controller('query')
export class QueryController {
    constructor(private readonly queryService: QueryService) {}

    // Accepts a path parameter: GET /query/<queryString>
    @Get(':queryString')
    async runQueryPath(@Param('queryString') queryString: string): Promise<any> {
        return this._run(queryString);
    }

    // Accepts a query parameter: GET /query?q=<queryString>
    @Get()
    async runQueryQueryParam(@Query('q') q?: string): Promise<any> {
        if (!q) {
            return { result: null, message: 'no query provided' };
        }
        return this._run(q);
    }

    private async _run(queryString: string) {
        // run the service's basicQuery flow and return its response
        const res = await this.queryService.basicQuery({ user_query: queryString });
        return res;
    }
}
