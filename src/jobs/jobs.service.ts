import { Injectable } from '@nestjs/common';

@Injectable()
export class JobsService {
  private timer: NodeJS.Timeout;

  execAfterTwoMinutes(job: Function) {
    this.timer = setTimeout(() => {
      job();
      this.clearTimer(this.timer);
    }, 120000);
  }

  private clearTimer(timer: NodeJS.Timeout) {
    clearTimeout(timer);
  }
}
