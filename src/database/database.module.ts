import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'ormconfig';
import { DatabaseService } from './database.service';

@Module({
  imports: [TypeOrmModule.forRoot(dataSource.options)],
  providers: [DatabaseService],
})
export class DatabaseModule {}
