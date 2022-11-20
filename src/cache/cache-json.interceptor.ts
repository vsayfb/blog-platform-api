import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { PublicPostDto } from 'src/posts/dto/public-post.dto';
import { BaseCacheInterceptor } from './interceptors/base-cache.interceptor';

@Injectable()
export class CacheJsonInterceptor
  extends BaseCacheInterceptor
  implements NestInterceptor
{
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = this.getHttp(context).getRequest();

    const key = this.extractKey(req);

    const cached = await this.cacheManager.json.get(key);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      map((value) => {
        this.cacheManager.json.set(key, '$', value);

        return value;
      }),
    );
  }
}
