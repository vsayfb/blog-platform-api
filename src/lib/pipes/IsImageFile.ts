import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class IsImageFilePipe implements PipeTransform {
  transform(image: Express.Multer.File, metadata: ArgumentMetadata) {
    const acceptMimeTypes = ['image/png', 'image/jpeg'];

    const fileType = acceptMimeTypes.find((type) => type === image.mimetype);

    console.log(fileType);

    if (!fileType) throw new NotAcceptableException();

    return image;
  }
}
