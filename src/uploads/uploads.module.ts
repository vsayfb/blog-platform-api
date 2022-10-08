import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/apis/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/apis/cloudinary/cloudinary.service';
import { IUploadImageService } from './interfaces/upload-image-service.interface';
import { UploadsService } from './uploads.service';

@Module({
  imports: [CloudinaryModule],
  providers: [
    UploadsService,
    { provide: IUploadImageService, useClass: CloudinaryService },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
