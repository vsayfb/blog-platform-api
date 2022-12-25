import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/account_notifications/services/notifications.service';
import { NotificationsGateway } from '../../gateways/notifications.gateway';
import { NewMessageDto } from '../../messages/response-dto/message-view.dto';
import { ChatsGateway } from '../../gateways/chats.gateway';

@Injectable()
export class GatewayEventsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly chatsGateway: ChatsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async newNotification(notificationID: string) {
    const notification = await this.notificationsService.getOneByID(
      notificationID,
    );

    await this.notificationsGateway.pushNotification(notification);
  }

  newMessage(message: NewMessageDto) {
    this.chatsGateway.sendMessageToChat(message.chat_id, message);
  }
}
