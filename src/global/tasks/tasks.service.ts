import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';

@Injectable()
export class TasksService {
  // store tasks somewhere to survive possible server failure 
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  execAfterGivenMinutes(cb: Function, minutes: number) {
    const TIMEOUT_NAME = 'after_minutes_' + nanoid();

    const timeout = setTimeout(() => {
      cb();

      this.deleteTimeout(TIMEOUT_NAME);
    }, minutes * 60000);

    this.schedulerRegistry.addTimeout(TIMEOUT_NAME, timeout);
  }

  execAfterGivenSeconds(cb: Function, seconds: number) {
    const TIMEOUT_NAME = 'after_seconds_' + nanoid();

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
