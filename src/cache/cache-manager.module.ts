import {
  CACHE_KEY_METADATA,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
  Module,
} from '@nestjs/common';
import { REDIS_CLIENT } from 'src/global/redis/constants';
import { CacheJSON } from './cache-json.interceptor';

@Module({
  providers: [
    { provide: CACHE_MANAGER, useExisting: REDIS_CLIENT },
    { provide: CACHE_TTL_METADATA, useValue: 10 },
    { provide: CACHE_KEY_METADATA, useValue: '' },
    CacheJSON,
  ],
  exports: [CacheJSON, CACHE_MANAGER, CACHE_TTL_METADATA, CACHE_KEY_METADATA],
})
export class CacheManagerModule {}
