import { Test, TestingModule } from '@nestjs/testing';
import { IUrlManageService } from '../interface/url-manage.interface';
import { SlugifyService } from '../services/slugify-service';
import { UrlManagementService } from '../services/url-management.service';

describe('UrlManagementService', () => {
  let urlManagementService: UrlManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlManagementService,
        { provide: IUrlManageService, useClass: SlugifyService },
      ],
    }).compile();

    urlManagementService =
      module.get<UrlManagementService>(UrlManagementService);
  });

  it('should be generated', () => {
    const text = 'this is a test';

    const result = urlManagementService.convertToUniqueUrl(text);

    expect(result).toBeDefined();
  });
});
