import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/apis/cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    return this.cloudinaryService.uploadProfileImage(file);
  }
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.cloudinaryService.uploadImage(file);
  }
}
