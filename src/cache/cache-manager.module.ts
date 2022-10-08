import { CACHE_MANAGER, Module } from '@nestjs/common';
import { REDIS_CLIENT } from 'src/global/redis/constants';
import { CacheJsonInterceptor } from './cache-json.interceptor';

@Module({
  providers: [
    { provide: CACHE_MANAGER, useExisting: REDIS_CLIENT },
    CacheJsonInterceptor,
  ],
  exports: [CacheJsonInterceptor, CACHE_MANAGER],
})
export class CacheManagerModule {}
