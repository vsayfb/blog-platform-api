import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { BaseCacheInterceptor } from './base-cache.interceptor';

/**
 * This interceptor uses cache aside pattern and caches data as public.
 *
 * You can specify a cache expiration time using @CacheTTL decorator.
 *
 * You can specify a cache key using @CacheKey decorator.
 */
@Injectable()
export class CachePublicJSON
  extends BaseCacheInterceptor
  implements NestInterceptor
{
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const key = this.extractKey(context);

    const cached = await this.cacheJsonService.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      map((value) => {
        const ttl = this.extractTTL(context);

        this.cacheJsonService.save({ key, data: value, ttl });

        return value;
      }),
    );
  }
}
