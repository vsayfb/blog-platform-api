import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { MessageViewDto } from '../dto/message-view.dto';
import { MessageMessages } from '../enums/message-messages';
import { GatewayEventsService } from '../../global/events/gateway-events.service';

@Injectable()
export class NewMessageInterceptor implements NestInterceptor {
  constructor(private readonly gatewayEventsService: GatewayEventsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<Promise<{ data: MessageViewDto; message: MessageMessages }>> {
    return next.handle().pipe(
      map(async (message: { data: MessageViewDto }) => {
        this.gatewayEventsService.newMessage(message.data);

        return { data: message.data, message: MessageMessages.SENT };
      }),
    );
  }
}
