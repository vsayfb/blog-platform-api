import {
  PipeTransform,
  Injectable,
  NotAcceptableException,
  ForbiddenException,
} from '@nestjs/common';
import { UploadMessages } from '../enums/upload-messages';

@Injectable()
export class RequiredImageFile implements PipeTransform {
  transform(image: Express.Multer.File) {
    if (!image) throw new ForbiddenException(UploadMessages.IMAGE_NOT_FOUND);

    const acceptMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

    const fileType = acceptMimeTypes.find((type) => type === image.mimetype);

    if (!fileType)
      throw new NotAcceptableException(
        'The file type not acceptable. Just [jpeg,png,webp]',
      );

    return image;
  }
}
