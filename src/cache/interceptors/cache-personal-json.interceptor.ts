import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { JwtPayload } from 'src/lib/jwt.payload';
import { BaseCacheInterceptor } from './base-cache.interceptor';

/**
 * This interceptor uses cache aside pattern and caches data as personal.
 *
 * You have to use @JwtAuthGuard to use this interceptor.
 *
 * You can specify a cache expiration time using @CacheTTL decorator.
 *
 * You can specify a cache key using @CacheKey decorator.
 */
@Injectable()
export class CachePersonalJSON
  extends BaseCacheInterceptor
  implements NestInterceptor
{
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const client: JwtPayload = context.switchToHttp().getRequest().user;

    const key = this.extractKey(context) + '/' + client.sub;

    const cached = await this.cacheJsonService.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      map((value) => {
        const ttl = this.extractTTL(context);

        this.cacheJsonService.save(key, value, ttl);

        return value;
      }),
    );
  }
}
