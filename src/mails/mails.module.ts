import { Module } from '@nestjs/common';
import { MailgunModule } from 'src/apis/mailgun/mailgun.module';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';
import { MailsService } from './mails.service';

@Module({
  imports: [MailgunModule],
  providers: [
    MailsService,
    { provide: IMailSenderService, useClass: MailgunService },
  ],
  exports: [MailsService],
})
export class MailsModule {}
