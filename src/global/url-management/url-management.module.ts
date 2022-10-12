import { Global, Module } from '@nestjs/common';
import { IUrlManageService } from './interface/url-manage.interface';
import { SlugifyService } from './services/slugify-service';
import { UrlManagementService } from './services/url-management.service';

@Global()
@Module({
  providers: [
    UrlManagementService,
    { provide: IUrlManageService, useClass: SlugifyService },
  ],
  exports: [UrlManagementService],
})
export class UrlManagementModule {}
