import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
// Mock the ESM-only transitive dependency of langchain that previously
// caused Jest to choke when requiring node_modules. This lets us use the
// real langchain package (CJS entrypoint) while shielding p-retry.
jest.mock('p-retry', () => {
  return (fn: any, opts?: any) => fn();
});

// Mock just the runtime initializer so the language model init path doesn't
// perform dynamic imports inside Jest's VM; other langchain bits still load.
jest.mock('langchain', () => ({
  initChatModel: jest.fn().mockResolvedValue({
    invoke: async (inputOrOptions: any) => {
      const input = typeof inputOrOptions === 'string' ? inputOrOptions : inputOrOptions.input;
      return { lc_kwargs: { content: `You queried for: ${input}` } };
    },
  }),
}));

import { PROMPTS } from '../src/utils/prompts';

let AppModule: any;

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    // lazy-load AppModule after mocks are in place
    AppModule = AppModule ?? require('./../src/app.module').AppModule;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/query/:value (GET - path param)', () => {
    return request(app.getHttpServer())
      .get('/query/abc123')
      .expect(200)
      .expect((res) => {
        const expected = `You queried for: ${PROMPTS.BASIC_CHAT_TEMPLATE.replace('{input}', 'abc123')}`;
        // response might be a plain string (model content) or a JSON object
        // stringified by Nest; accept either shape.
        try {
          const body = JSON.parse(res.text);
          expect(body).toHaveProperty('result');
          expect(body.result).toMatch(/You queried for:/);
        } catch {
          expect(res.text).toEqual(expected);
        }
      });
  });

  it('/query?q=<value> (GET - query param)', () => {
    return request(app.getHttpServer())
      .get('/query')
      .query({ q: 'from-q' })
      .expect(200)
      .expect((res) => {
        const expected = `You queried for: ${PROMPTS.BASIC_CHAT_TEMPLATE.replace('{input}', 'from-q')}`;
        try {
          const body = JSON.parse(res.text);
          expect(body).toHaveProperty('result');
          expect(body.result).toMatch(/You queried for:/);
        } catch {
          expect(res.text).toEqual(expected);
        }
      });
  });
});
