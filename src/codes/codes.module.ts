import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './entities/code.entity';
import { CodesService } from './codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  providers: [CodesService],
  exports: [CodesService],
})
export class CodesModule {}
