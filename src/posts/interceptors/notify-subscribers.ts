import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { CreatedPostDto } from '../response-dto/created-post.dto';
import { PostMessages } from '../enums/post-messages';
import { MailsWorker } from 'src/global/queues/workers/mails.worker';
import { NotificationsWorker } from 'src/global/queues/workers/notifications.worker';

@Injectable()
export class NotifySubcribers implements NestInterceptor {
  constructor(
    private readonly mailsWorker: MailsWorker,
    private readonly notificationsWorker: NotificationsWorker,
  ) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<{ data: CreatedPostDto; message: PostMessages }> {
    return next.handle().pipe(
      map((value: { data: CreatedPostDto; message: PostMessages }) => {
        const notificationObject = {
          author: value.data.author,
          subject: 'published a post.',
          post: value.data,
        };

        this.mailsWorker.produceSubscriberMails(notificationObject);

        this.notificationsWorker.produceSubcriberNotifications(
          notificationObject,
        );

        return value;
      }),
    );
  }
}
