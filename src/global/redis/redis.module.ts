import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { RedisClientOptions } from 'redis';
import { REDIS_CLIENT, REDIS_CLIENT_OPTS } from './constants';
import { RedisService } from './redis.service';

const redisClient = {
  provide: REDIS_CLIENT,
  useFactory: async (redisService: RedisService, logger: Logger) => {
    try {
      return await redisService.getClient();
    } catch (err: any) {
      logger.error('[REDIS MODULE] ' + err.message);
    }
  },
  inject: [RedisService, Logger],
};

@Module({})
export class RedisModule {
  static forRoot(options: RedisClientOptions): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      providers: [
        RedisService,
        Logger,
        {
          provide: REDIS_CLIENT_OPTS,
          useValue: options,
        },
        redisClient,
      ],
      exports: [REDIS_CLIENT],
    };
  }
}
