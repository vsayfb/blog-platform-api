import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/apis/cloudinary/cloudinary.module';
import { UploadsService } from './uploads.service';

@Module({
  imports: [CloudinaryModule],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
