import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { BaseCacheInterceptor } from './interceptors/base-cache.interceptor';

@Injectable()
export class CacheJSON extends BaseCacheInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const key = this.extractKey(context);

    const cached = await this.cacheManager.json.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      map((value) => {
        const TTL = this.extractTTL(context);

        this.cacheManager.json.set(key, '$', value);

        this.cacheManager.expire(key, TTL);

        return value;
      }),
    );
  }
}
