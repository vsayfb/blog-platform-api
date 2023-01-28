import { Injectable } from '@nestjs/common';
import { NewMessageDto } from '../../messages/response-dto/message-view.dto';
import { ChatsGateway } from '../../gateways/chats.gateway';
import { NotificationsWorker } from 'src/global/queues/workers/notifications.worker';

@Injectable()
export class GatewayEventsService {
  constructor(
    private readonly chatsGateway: ChatsGateway,
    private readonly notificationsWorker: NotificationsWorker,
  ) {}

  newNotification(notificationID: string) {
    this.notificationsWorker.produceAccountsNotifications(notificationID);
  }

  newMessage(message: NewMessageDto) {
    this.chatsGateway.sendMessageToChat(message.chat_id, message);
  }
}
