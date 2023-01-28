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
  private connected = false;

  constructor(
    @Inject(REDIS_CLIENT_OPTS)
    private readonly redisClientOpts: RedisClientOptions<
      RedisDefaultModules,
      Record<string, never>,
      Record<string, never>
    >,
  ) {}

  async getClient(): Promise<RedisClientType> {
    if (this.connected) return this.redisClient;

    try {
      this.redisClient = createClient(this.redisClientOpts);

      await this.redisClient.connect();

      this.connected = true;

      return this.redisClient;
    } catch (error) {
      throw error;
    }
  }
}
