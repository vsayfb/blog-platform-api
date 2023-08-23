import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessEnv } from 'src/lib/enums/env';
import { AccountMessages } from 'src/resources/accounts/enums/account-messages';
import { ISmsSenderService } from 'src/sms/interfaces/sms-service.interface';
import * as twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

type InvalidPhone = {
  status: number;
  code: number;
};

@Injectable()
export class TwilioService implements ISmsSenderService {
  private readonly twilioClient: twilio.Twilio = null;

  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.get<string>(ProcessEnv.TWILIO_ACCOUNT_SID);

    const authToken = configService.get<string>(ProcessEnv.TWILIO_AUTH_TOKEN);

    this.twilioClient = twilio(accountSid, authToken);
  }

  async send(to: string, data: string): Promise<MessageInstance> {
    const from = this.configService.get<string>(
      ProcessEnv.TWILIO_MESSAGING_SERVICE_SID,
    );

    try {
      return await this.twilioClient.messages.create({
        to,
        messagingServiceSid: from,
        body: data,
      });
    } catch (error: InvalidPhone | any) {
      console.log(error);

      if (error.code === 21211) {
        throw new BadRequestException(AccountMessages.INVALID_MOBILE_PHONE);
      } else {
        throw new BadGatewayException(error);
      }
    }
  }
}
