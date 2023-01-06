import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { MailsService } from 'src/mails/mails.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { CreatedPostDto } from '../response-dto/created-post.dto';
import { PostMessages } from '../enums/post-messages';

@Injectable()
export class NotifySubcribers implements NestInterceptor {
  private subscriptionsService: SubscriptionsService;
  private mailsService: MailsService;

  constructor(private readonly moduleRef: ModuleRef) {
    this.subscriptionsService = this.moduleRef.get(SubscriptionsService, {
      strict: false,
    });

    this.mailsService = this.moduleRef.get(MailsService, {
      strict: false,
    });
  }

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Promise<{ data: CreatedPostDto; message: PostMessages }>> {
    return next.handle().pipe(
      map(async (value: { data: CreatedPostDto; message: PostMessages }) => {
        const { author, title, content } = value.data;

        const subscribers = await this.subscriptionsService.getSubscribers(
          author.id,
        );

        if (subscribers.length) {
          this.mailsService.send(
            subscribers.map((s) => s.email),
            `${author.display_name} - ${title}`,
            content,
          );
        }

        return value;
      }),
    );
  }
}