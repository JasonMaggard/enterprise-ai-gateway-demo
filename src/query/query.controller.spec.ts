// Prevent the real service (which pulls in ESM-only modules) from being
// required during tests — we'll provide a test double below.
jest.mock('./query.service', () => ({ QueryService: jest.fn() }));

import { Test, TestingModule } from '@nestjs/testing';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';

describe('QueryController', () => {
  let controller: QueryController;

  beforeEach(async () => {
    const mockService = {
      basicQuery: jest.fn().mockImplementation(({ user_query }: any) => Promise.resolve(`You queried for: ${user_query}`)),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryController],
      providers: [{ provide: QueryService, useValue: mockService }],
    }).compile();

    controller = module.get<QueryController>(QueryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should respond to a path param', async () => {
    const res = await controller.runQueryPath('hello');
    expect(res).toEqual('You queried for: hello');
  });

  it('should respond to a query param', async () => {
    const res = await controller.runQueryParam('world');
    expect(res).toEqual('You queried for: world');
  });

  it('should return a friendly message when q is missing', async () => {
    const res = await controller.runQueryParam(undefined);
    expect(res).toEqual({ result: null, message: 'no query provided' });
  });
});
