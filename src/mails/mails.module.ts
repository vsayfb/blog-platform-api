import { Module } from '@nestjs/common';
import { MailgunModule } from 'src/apis/mailgun/mailgun.module';
import { CodesModule } from 'src/codes/codes.module';
import { MailsService } from './mails.service';

@Module({
  imports: [MailgunModule, CodesModule],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
