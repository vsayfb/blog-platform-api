import { Test, TestingModule } from '@nestjs/testing';
import { CacheJsonService } from './cache-json.service';

describe('CacheJsonService', () => {
  let service: CacheJsonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheJsonService],
    }).compile();

    service = module.get<CacheJsonService>(CacheJsonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
