import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ProcessEnv } from 'src/lib/enums/env';
import { smsStub } from 'src/sms/stub/sms.stub';
import { TwilioService } from './twilio.service';

const twilioClient = {
  messages: {
    create: jest.fn(),
  },
};

jest.mock('../../../node_modules/twilio', function () {
  return () => twilioClient;
});

describe('TwilioService', () => {
  let twilioService: TwilioService;
  let configService = { get: jest.fn().mockReturnValue('') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    twilioService = module.get<TwilioService>(TwilioService);
  });

  describe('sendSms', () => {
    let result: void;
    const to = smsStub().to;
    const data = smsStub().data;

    beforeEach(async () => {
      result = await twilioService.sendMessage(to, data);
    });

    test('calls configService.get method', () => {
      expect(configService.get).toHaveBeenCalledWith(
        ProcessEnv.TWILIO_MESSAGING_SERVICE_SID,
      );
    });

    test('calls twilioClient.messages.create', () => {
      expect(twilioClient.messages.create).toHaveBeenCalledWith({
        to,
        messagingServiceSid: expect.any(String),
        body: data,
      });
    });

    it('should return void', () => {
      expect(result).not.toBeDefined();
    });
  });
});
