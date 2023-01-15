import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class CacheJsonService {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: RedisClientType,
  ) {}

  async get(key: string): Promise<any> {
    return await this.cacheManager.json.get(key);
  }

  async save(key: string, data: any, ttl: number) {
    try {
      await this.cacheManager.json.set(key, '$', data);

      await this.cacheManager.expire(key, ttl);
    } catch (error) {
      console.log(error);
    }
  }

  async update(key: string, data: Record<string, any>) {
    try {
      const cache = await this.get(key);

      if (cache)
        await this.cacheManager.json.set(key, '$', {
          ...(cache as any),
          ...data,
        });
    } catch (error) {
      console.log(error);
    }
  }

  async updateFields(key: string, data: Record<string, any>) {
    try {
      for (const k in data)
        await this.cacheManager.json.set(key, `.data.${k}`, data[k]);
    } catch (error) {
      console.log(error);
    }
  }

  async insertToArray(key: string, data: Record<string, any>, index?: number) {
    try {
      if (await this.get(key))
        await this.cacheManager.json.arrInsert(key, '.data', index || 0, data);
    } catch (error) {
      console.log(error);
    }
  }

  async updateInArray(key: string, id: string, data: Record<string, any>) {
    try {
      const res = await this.get(key);

      if (res) {
        res.data.map((d) => {
          if (d.id === id) {
            for (const key in d) {
              d[key] = data[key];
            }
          }
        });

        await this.cacheManager.json.set(key, `$`, res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async remove(key: string) {
    await this.cacheManager.del(key);
  }

  async removeFromArray(key: string, data: Record<string, any>) {
    try {
      const index = await this.cacheManager.json.arrIndex(key, '.data', data);

      if (index >= 0)
        await this.cacheManager.json.arrPop(key, '.data', index as number);
    } catch (error) {
      console.log(error);
    }
  }
}
