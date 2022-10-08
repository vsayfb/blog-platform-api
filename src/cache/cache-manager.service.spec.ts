import { Test, TestingModule } from '@nestjs/testing';
import { CacheManagerService } from './cache-manager.service';

describe('CacheManagerService', () => {
  let service: CacheManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheManagerService],
    }).compile();

    service = module.get<CacheManagerService>(CacheManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
