import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { NewMessageDto } from '../response-dto/message-view.dto';
import { MessageMessages } from '../enums/message-messages';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';

@Injectable()
export class NewMessageInterceptor implements NestInterceptor {
  constructor(private readonly gatewayEventsService: GatewayEventsService) {}

  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<{ data: NewMessageDto; message: MessageMessages }> {
    return next.handle().pipe(
      map((message: { data: NewMessageDto }) => {
        this.gatewayEventsService.newMessage(message.data);

        return { data: message.data, message: MessageMessages.SENT };
      }),
    );
  }
}
