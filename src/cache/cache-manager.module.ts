import {
  CACHE_KEY_METADATA,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
  Module,
} from '@nestjs/common';
import { REDIS_CLIENT } from 'src/global/redis/constants';
import { CachePersonalJSON } from './interceptors/cache-personal-json.interceptor';
import { CachePublicJSON } from './interceptors/cache-public-json.interceptor';
import { CacheJsonService } from './services/cache-json.service';

@Module({
  providers: [
    { provide: CACHE_MANAGER, useExisting: REDIS_CLIENT },
    { provide: CACHE_TTL_METADATA, useValue: 60 },
    { provide: CACHE_KEY_METADATA, useValue: '' },
    CachePublicJSON,
    CachePersonalJSON,
    CacheJsonService,
  ],
  exports: [
    CACHE_MANAGER,
    CACHE_TTL_METADATA,
    CACHE_KEY_METADATA,
    CachePublicJSON,
    CachePersonalJSON,
    CacheJsonService,
  ],
})
export class CacheManagerModule {}
