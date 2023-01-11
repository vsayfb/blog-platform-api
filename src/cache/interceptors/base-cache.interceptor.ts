import {
  CACHE_KEY_METADATA,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisClientType } from 'redis';

export abstract class BaseCacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: RedisClientType,
    @Inject(CACHE_TTL_METADATA) private readonly cacheTTL: number,
    @Inject(CACHE_KEY_METADATA) private readonly cacheKey: string,
    private readonly reflector: Reflector,
  ) {}

  protected getHttp(executionContext: ExecutionContext) {
    return executionContext.switchToHttp();
  }

  protected extractKey(context: ExecutionContext): string {
    const req = this.getHttp(context).getRequest();

    return (
      this.reflector.get(CACHE_KEY_METADATA, context.getHandler()) ||
      `${req.protocol}://${req.get('Host')}${req.originalUrl}`
    );
  }

  protected extractTTL(context: any): number {
    return (
      this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ||
      this.cacheTTL
    );
  }
}
