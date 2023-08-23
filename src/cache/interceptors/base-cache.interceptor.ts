import { ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheJsonService } from '../services/cache-json.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/cache-manager';

export abstract class BaseCacheInterceptor {
  constructor(
    @Inject(CACHE_TTL_METADATA) private readonly cacheTTL: number,
    private readonly reflector: Reflector,
    protected readonly cacheJsonService: CacheJsonService,
  ) {}

  protected getHttp(executionContext: ExecutionContext) {
    return executionContext.switchToHttp();
  }

  protected extractKey(context: ExecutionContext): string {
    const req = this.getHttp(context).getRequest();

    const customKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    return customKey || `${req.originalUrl}`;
  }

  protected extractTTL(context: ExecutionContext): number {
    const customTTL = this.reflector.get(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    return customTTL || this.cacheTTL;
  }
}
