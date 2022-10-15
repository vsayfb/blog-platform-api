import { Test } from '@nestjs/testing';
import { TwilioService } from 'src/apis/twilio/twilio.service';
import { SmsMessages } from './enums/messages';
import { ISmsSenderService } from './interfaces/sms-service.interface';
import { SmsService } from './sms.service';
import { smsStub } from './stub/sms.stub';

jest.mock('src/apis/twilio/twilio.service');

describe('SmsService', () => {
  let smsService: SmsService;
  let smsSenderService: ISmsSenderService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SmsService,
        { provide: ISmsSenderService, useClass: TwilioService },
      ],
    }).compile();

    smsService = module.get<SmsService>(SmsService);

    smsSenderService = module.get<ISmsSenderService>(ISmsSenderService);
  });

  describe('sendSms', () => {
    describe('scenario : sms is sent', () => {
      let result: void;

      const to = smsStub().to;

      const data = smsStub().data;

      beforeEach(async () => {
        result = await smsService.sendSms(to, data);
      });

      test('calls smsSenderService.sendMessage', () => {
        expect(smsSenderService.sendMessage).toHaveBeenCalledWith(to, data);
      });

      it('should return void', () => {
        expect(result).not.toBeDefined();
      });
    });

    describe('scenario : sms is not sent', () => {
      const to = smsStub().to;

      const data = smsStub().data;

      beforeEach(() => {
        jest.spyOn(smsSenderService, 'sendMessage').mockRejectedValue('');
      });

      it('should return Sms is not sent error message', async () => {
        await expect(smsService.sendSms(to, data)).rejects.toThrowError(
          SmsMessages.ERROR,
        );
      });
    });
  });
});
