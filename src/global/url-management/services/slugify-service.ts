import { Injectable } from '@nestjs/common';
import { IUrlManageService } from '../interface/url-manage.interface';
import ShortUniqueID from 'short-unique-id';
import slugify from 'slugify';

@Injectable()
export class SlugifyService implements IUrlManageService {
  generateUniqueUrl(text: string): string {
    const uniqueID = new ShortUniqueID();

    const slug = slugify(text, { lower: true });

    return slug + '-' + uniqueID();
  }
}
