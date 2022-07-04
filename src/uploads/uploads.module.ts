import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/apis/cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/apis/cloudinary/cloudinary.service';
import { UploadsService } from './uploads.service';

@Module({
  imports: [CloudinaryModule],
  providers: [UploadsService, CloudinaryService],
  exports: [UploadsService],
})
export class UploadsModule {}
