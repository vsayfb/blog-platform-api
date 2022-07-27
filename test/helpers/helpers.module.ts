import { Module } from '@nestjs/common';
import { DatabaseModule } from 'test/database/database.module';
import { HelpersService } from './helpers.service';

@Module({
  imports: [DatabaseModule],
  providers: [HelpersService],
  exports: [HelpersService],
})
export class HelpersModule {}
