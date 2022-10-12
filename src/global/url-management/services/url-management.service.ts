import { Inject, Injectable } from '@nestjs/common';
import { IUrlManageService } from '../interface/url-manage.interface';

@Injectable()
export class UrlManagementService {
  constructor(
    @Inject(IUrlManageService) private urlManageService: IUrlManageService,
  ) {}

  convertToUniqueUrl(text: string): string {
    return this.urlManageService.generateUniqueUrl(text);
  }
}
