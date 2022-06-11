import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Module({
  providers: [UploadsService],
})
export class UploadsModule {}
