import { Inject, Injectable } from '@nestjs/common';
import { ISmsSenderService } from './interfaces/sms-service.interface';

@Injectable()
export class SmsService {
  constructor(
    @Inject(ISmsSenderService)
    private readonly smsSenderService: ISmsSenderService,
  ) {}

  async send(to: string, data: string): Promise<boolean> {
    await this.smsSenderService.send(to, data);

    return true;
  }
}
