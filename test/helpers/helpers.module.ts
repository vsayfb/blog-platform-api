import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HelpersService } from './helpers.service';

@Module({
  imports: [DatabaseModule],
  providers: [HelpersService],
  exports: [HelpersService],
})
export class HelpersModule {}
