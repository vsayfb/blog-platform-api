import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'ormconfig';
import { DatabaseService } from './database.service';

@Module({
  imports: [TypeOrmModule.forRoot(config)],
  providers: [DatabaseService],
})
export class DatabaseModule {}
