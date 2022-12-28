import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { TemporaryAccountsService } from 'src/accounts/services/temporary-accounts.service';
import { TasksService } from 'src/global/tasks/tasks.service';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';

/**
 * Removes unused temporary accounts by req.body.username, if they exist.
 */

@Injectable()
export class DeleteTemporaryAccount implements NestInterceptor {
  constructor(
    private readonly tempAccountsService: TemporaryAccountsService,
    private readonly tasksService: TasksService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req: { body: { username: string } } = context
      .switchToHttp()
      .getRequest();

    return next.handle().pipe(
      map((value: { following_url: string; message: CodeMessages }) => {
        this.tasksService.execAfterGivenMinutes(
          () =>
            this.tempAccountsService.deleteByUsernameIfExist(req.body.username),
          6,
        );

        return value;
      }),
    );
  }
}
