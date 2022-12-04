import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  execAfterTwoMinutes(cb: Function) {
    const TIMEOUT_NAME = 'after_two';

    const timeout = setTimeout(() => {
      cb();

      this.deleteTimeout(TIMEOUT_NAME);
    }, 120000);

    this.schedulerRegistry.addTimeout(TIMEOUT_NAME, timeout);
  }

  private deleteTimeout(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
  }
}
