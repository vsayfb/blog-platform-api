import { Inject, Injectable } from '@nestjs/common';
import { IUploadImageService } from './interfaces/upload-image-service.interface';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(IUploadImageService)
    private uploadImageService: IUploadImageService,
  ) {}

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    return this.uploadImageService.uploadProfileImage(file);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.uploadImageService.uploadImage(file);
  }
}
