import { Injectable } from '@nestjs/common';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';

@Injectable()
export class MailsService {
  constructor(
    private readonly mailgun: MailgunService,
    private readonly codeService: CodesService,
  ) {}

  async sendVerificationCode(to: string) {
    const { code } = await this.codeService.createCode(to);

    await this.mailgun.sendMail('vsayfb@gmail.com', to, 'Register', code);

    return { message: 'Mail sent.' };
  }
}
