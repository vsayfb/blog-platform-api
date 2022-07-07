import {
  PipeTransform,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class IsImageFilePipe implements PipeTransform {
  transform(image: Express.Multer.File) {
    const acceptMimeTypes = ['image/png', 'image/jpeg'];

    const fileType = acceptMimeTypes.find((type) => type === image.mimetype);

    if (!fileType) throw new NotAcceptableException();

    return image;
  }
}
