import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Codes } from './codes.entity';
import { CodesService } from './codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Codes])],
  providers: [CodesService],
  exports: [CodesService],
})
export class CodesModule {}
