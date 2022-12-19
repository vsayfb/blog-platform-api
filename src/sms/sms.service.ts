import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ISmsSenderService } from './interfaces/sms-service.interface';

@Injectable()
export class SmsService {
  constructor(
    @Inject(ISmsSenderService)
    private readonly smsSenderService: ISmsSenderService,
  ) {}

  async sendSMS(to: string, data: string): Promise<boolean> {
    try {
      await this.smsSenderService.send(to, data);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
