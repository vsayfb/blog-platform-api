import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { MailsModule } from 'src/mails/mails.module';
import { UploadsModule } from 'src/uploads/uploads.module';
import { PasswordManagerService } from './services/password-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), MailsModule, UploadsModule],
  controllers: [AccountsController],
  providers: [AccountsService, PasswordManagerService],
  exports: [AccountsService, PasswordManagerService],
})
export class AccountsModule {}
