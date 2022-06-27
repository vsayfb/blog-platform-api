import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { MailgunService } from 'src/apis/mailgun/mailgun.service';
import { CodesService } from 'src/codes/codes.service';
import { JobsService } from 'src/jobs/jobs.service';
import { MailsService } from './mails.service';

jest.mock('src/codes/codes.service');
jest.mock('src/apis/mailgun/mailgun.service');
jest.mock('src/jobs/jobs.service');

describe('MailsService', () => {
  let service: MailsService;
  let codesService: CodesService;
  let mailgunService: MailgunService;
  let jobsService: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailsService,
        CodesService,
        MailgunService,
        JobsService,
        { provide: ConfigService, useValue: { get: jest.fn(() => '') } },
      ],
    }).compile();

    service = module.get<MailsService>(MailsService);
    codesService = module.get<CodesService>(CodesService);
    mailgunService = module.get<MailgunService>(MailgunService);
    jobsService = module.get<JobsService>(JobsService);
  });

  describe('sendVerificationCode', () => {
    describe('when sendVerificationCode is called', () => {
      const to = accountStub();
      let result: { message: string };

      beforeEach(
        async () =>
          (result = await service.sendVerificationCode({
            email: to.email,
            username: to.username,
          })),
      );

      test('codeService.createCode should be called', () => {
        expect(codesService.createCode).toHaveBeenCalledWith(to.email);
      });

      test('mockMailgunService.sendMail should be called', () => {
        expect(mailgunService.sendVerificationMail).toHaveBeenCalled();
      });

      test('jobsService.execAfterTwoMinutes should be called', () => {
        expect(jobsService.execAfterTwoMinutes).toHaveBeenCalled();
      });

      it('should return a message', () => {
        expect(result).toEqual({ message: 'Mail sent.' });
      });
    });
  });
});
