import { Module } from '@nestjs/common';
import { TestDatabaseService } from './database.service';

@Module({ providers: [TestDatabaseService], exports: [TestDatabaseService] })
export class DatabaseModule {}
