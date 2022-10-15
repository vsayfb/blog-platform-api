import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SmsMessages } from './enums/messages';
import { ISmsSenderService } from './interfaces/sms-service.interface';

@Injectable()
export class SmsService {
  constructor(
    @Inject(ISmsSenderService)
    private readonly smsSenderService: ISmsSenderService,
  ) {}

  async sendSms(to: string, data: string): Promise<void> {
    try {
      await this.smsSenderService.sendMessage(to, data);
    } catch (error) {
      throw new ServiceUnavailableException(SmsMessages.ERROR);
    }
  }
}
