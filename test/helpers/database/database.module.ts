import { Module } from '@nestjs/common';
import { AccountsModule } from 'src/resources/accounts/accounts.module';
import { TestDatabaseService } from './database.service';

@Module({
  imports: [AccountsModule],
  providers: [TestDatabaseService],
  exports: [TestDatabaseService],
})
export class DatabaseModule {}
