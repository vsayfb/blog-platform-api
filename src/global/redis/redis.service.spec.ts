import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_CLIENT, REDIS_CLIENT_OPTS } from './constants';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: REDIS_CLIENT, useValue: jest.fn() },
        { provide: REDIS_CLIENT_OPTS, useValue: jest.fn() },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', async () => {
    expect(redisService.getClient()).toBeDefined();
  });
});
