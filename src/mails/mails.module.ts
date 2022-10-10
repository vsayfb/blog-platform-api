import { Module } from '@nestjs/common';
import { MailgunModule } from 'src/apis/mailgun/mailgun.module';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesModule } from 'src/codes/codes.module';
import { IMailSenderService } from './interfaces/mail-sender-service.interface';
import { MailsService } from './mails.service';

@Module({
  imports: [MailgunModule, CodesModule],
  providers: [
    MailsService,
    { provide: IMailSenderService, useClass: MailgunService },
  ],
  exports: [MailsService],
})
export class MailsModule {}
