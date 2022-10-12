import { Test, TestingModule } from '@nestjs/testing';
import { SlugifyService } from '../services/slugify-service';

describe('SlugifyService', () => {
  let slugifyService: SlugifyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlugifyService],
    }).compile();

    slugifyService = module.get<SlugifyService>(SlugifyService);
  });

  it('should be generated', () => {
    const text = 'This is a test';

    expect(slugifyService.generateUniqueUrl(text)).toBeDefined();
  });
});
