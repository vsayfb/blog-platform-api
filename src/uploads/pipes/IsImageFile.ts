import {
  PipeTransform,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class IsImageFilePipe implements PipeTransform {
  transform(image: Express.Multer.File) {
    if (!image) return null;

    const acceptMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

    const fileType = acceptMimeTypes.find((type) => type === image.mimetype);

    if (!fileType)
      throw new NotAcceptableException(
        'The file type not acceptable. Just [jpeg,png,webp]',
      );

    return image;
  }
}
