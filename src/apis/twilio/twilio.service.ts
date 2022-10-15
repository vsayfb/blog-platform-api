import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessEnv } from 'src/lib/enums/env';
import { ISmsSenderService } from 'src/sms/interfaces/sms-service.interface';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService implements ISmsSenderService {
  private readonly twilioClient: twilio.Twilio = null;

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.get<string>(ProcessEnv.TWILIO_ACCOUNT_SID);

    const authToken = configService.get<string>(ProcessEnv.TWILIO_AUTH_TOKEN);

    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendMessage(to: string, data: string): Promise<void> {
    const from = this.configService.get<string>(
      ProcessEnv.TWILIO_MESSAGING_SERVICE_SID,
    );

    await this.twilioClient.messages.create({
      to,
      messagingServiceSid: from,
      body: data,
    });
  }
}
