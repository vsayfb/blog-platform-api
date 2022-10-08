import { CACHE_MANAGER, ExecutionContext, Inject } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { RedisClientType } from 'redis';

export abstract class BaseCacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: RedisClientType,
  ) {}

  protected getHttp(executionContext: ExecutionContext) {
    return executionContext.switchToHttp();
  }

  protected extractKey(request: any) {
    return `${request.protocol}://${request.get('Host')}${request.originalUrl}`;
  }
}
