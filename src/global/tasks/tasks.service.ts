import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  execAfterGivenMinutes(cb: Function, minutes: number) {
    const TIMEOUT_NAME = 'after_minutes_' + Date.now().toString();

    const timeout = setTimeout(() => {
      cb();

      this.deleteTimeout(TIMEOUT_NAME);
    }, minutes * 60000);

    this.schedulerRegistry.addTimeout(TIMEOUT_NAME, timeout);
  }

  execAfterGivenSeconds(cb: Function, seconds: number) {
    const TIMEOUT_NAME = 'after_seconds_' + Date.now().toString();

    const timeout = setTimeout(() => {
      cb();

      this.deleteTimeout(TIMEOUT_NAME);
    }, seconds * 1000);

    this.schedulerRegistry.addTimeout(TIMEOUT_NAME, timeout);
  }

  private deleteTimeout(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
  }
}
