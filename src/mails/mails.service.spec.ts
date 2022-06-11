import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';
import { JobsService } from 'src/jobs/jobs.service';
import { MailsService } from './mails.service';

jest.mock('src/codes/codes.service');

describe('MailsService', () => {
  let service: MailsService;
  let codesService: CodesService;

  const mockMailgunService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailsService,
        CodesService,
        {
          provide: MailgunService,
          useValue: mockMailgunService,
        },
        JobsService,
        { provide: ConfigService, useValue: { get: jest.fn(() => '') } },
      ],
    }).compile();

    service = module.get<MailsService>(MailsService);
    codesService = module.get<CodesService>(CodesService);
  });

  describe('sendVerificationCode', () => {
    describe('when sendVerificationCode is called', () => {
      const to = accountStub().email;
      let result: { message: string };

      beforeEach(
        async () =>
          (result = await service.sendVerificationCode(accountStub().email)),
      );

      test('codeService.createCode should be called', () => {
        expect(codesService.createCode).toHaveBeenCalledWith(to);
      });

      test('mockMailgunService.sendMail should be called', () => {
        expect(mockMailgunService.sendMail).toHaveBeenCalled();
      });

      it('should return a message', () => {
        expect(result).toEqual({ message: 'Mail sent.' });
      });
    });
  });
});
