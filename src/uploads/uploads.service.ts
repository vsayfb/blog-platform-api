import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/apis/cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async upload(file: Express.Multer.File) {
    return this.cloudinaryService.uploadImage(file);
  }
}
