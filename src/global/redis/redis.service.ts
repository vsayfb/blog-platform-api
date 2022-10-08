import { Inject, Injectable } from '@nestjs/common';
import {
  createClient,
  RedisClientOptions,
  RedisClientType,
  RedisDefaultModules,
} from 'redis';
import { REDIS_CLIENT_OPTS } from './constants';

@Injectable()
export class RedisService {
  private redisClient: RedisClientType;
  private redisConnected = false;

  constructor(
    @Inject(REDIS_CLIENT_OPTS)
    private readonly redisClientOpts: RedisClientOptions<
      RedisDefaultModules,
      Record<string, never>,
      Record<string, never>
    >,
  ) {}

  async getClient(): Promise<RedisClientType> {
    if (!this.redisConnected) {
      this.redisClient = createClient(this.redisClientOpts);

      this.redisClient.on('error', (err) => {
        throw err;
      });

      this.redisClient.on('connect', () => {
        this.redisConnected = true;
      });

      await this.redisClient.connect();
    }

    return this.redisClient;
  }
}
