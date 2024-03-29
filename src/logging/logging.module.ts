import { Module } from '@nestjs/common';
import { ElasticModule } from 'src/global/elastic/elastic.module';
import { LoggingService } from './logging.service';

@Module({
  imports: [ElasticModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
