import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';

describe('TasksService', () => {
  let tasksService: TasksService;

  const mockSchedulerRegistry = {
    addTimeout: jest.fn(),
    deleteTimeout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  describe('execAfterTwoMinutes', () => {
    describe('when execAfterTwoMinutes is called', () => {
      const callback = jest.fn();

      beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        //@ts-ignore
        jest.spyOn(TasksService.prototype as any, 'deleteTimeout');
        tasksService.execAfterTwoMinutes(callback);
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
        test('then calls deleteTimeout', () => {
          //@ts-ignore
          expect(tasksService.deleteTimeout).toHaveBeenCalled();
          /** private method  */
        });
      });
    });
  });
});
