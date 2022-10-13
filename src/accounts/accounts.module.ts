import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { PasswordManagerService } from './services/password-manager.service';
import { GoogleAccountsService } from './services/google-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UploadsModule],
  controllers: [AccountsController],
  providers: [AccountsService, GoogleAccountsService, PasswordManagerService],
  exports: [AccountsService, GoogleAccountsService, PasswordManagerService],
})
export class AccountsModule {}
