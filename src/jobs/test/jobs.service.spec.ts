import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from '../jobs.service';

describe('JobsService', () => {
  let jobsService: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobsService],
    }).compile();

    jobsService = module.get<JobsService>(JobsService);
  });

  describe('execAfterTwoMinutes', () => {
    describe('when execAfterTwoMinutes is called', () => {
      const callback = jest.fn();

      beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        //private method
        jest.spyOn(JobsService.prototype as any, 'clearTimer');
        jobsService.execAfterTwoMinutes(callback);
      });

      test('callback should not have been called yet', () => {
        expect(callback).not.toHaveBeenCalled();
      });

      describe('when setTimeout is called', () => {
        test('should exec setTimeout', () => {
          jest.runAllTimers();
          expect(setTimeout).toHaveBeenCalled();
        });

        test('setTimeout exec given callback function after two minutes', () => {
          expect(callback).toHaveBeenCalled();
        });
        test('then calls clearTimer', () => {
          //@ts-ignore
          expect(jobsService.clearTimer).toHaveBeenCalled();
          /** private method  */
        });
      });
    });
  });
});
