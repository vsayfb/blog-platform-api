import { Injectable } from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { CodeVerificationProcess } from 'src/codes/entities/code.entity';
import { TasksService } from 'src/global/tasks/tasks.service';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly mailsService: MailsService,
    private readonly tasksService: TasksService,
    private readonly codesService: CodesService,
  ) {}

  async registerVerification({
    username,
    email,
  }: {
    username: string;
    email: string;
  }) {
    const code = this.codesService.generate();

    const sent = await this.mailsService.sendVerificationCode(
      {
        username,
        email,
      },
      code,
    );

    const created = await this.codesService.create({
      receiver: email,
      code,
      process: CodeVerificationProcess.REGISTER_EMAIL,
    });

    if (sent) {
      this.tasksService.execAfterTwoMinutes(() =>
        this.codesService.deleteIfExists(created.id),
      );
    } else {
      this.codesService.delete(created);
    }
  }
}
