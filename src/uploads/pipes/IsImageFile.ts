import {
  PipeTransform,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class IsImageFilePipe implements PipeTransform {
  transform(image: Express.Multer.File) {
    if (!image) throw new NotAcceptableException();

    const acceptMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

    const fileType = acceptMimeTypes.find((type) => type === image.mimetype);

    if (!fileType) throw new NotAcceptableException();

    return image;
  }
}
