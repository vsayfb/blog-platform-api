import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/account_notifications/services/notifications.service';
import { NotificationsGateway } from '../../gateways/notifications.gateway';
import { NewMessageDto } from '../../messages/response-dto/message-view.dto';
import { ChatsGateway } from '../../gateways/chats.gateway';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';

@Injectable()
export class GatewayEventsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly chatsGateway: ChatsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly cacheJsonService: CacheJsonService,
  ) {}

  async newNotification(notificationID: string) {
    const notification = await this.notificationsService.getOneByID(
      notificationID,
    );

    this.cacheJsonService.insertToArray(
      CACHED_ROUTES.CLIENT_NOTIFS + notification.notifable.id,
      notification,
    );

    this.notificationsGateway.pushNotification(notification);
  }

  newMessage(message: NewMessageDto) {
    this.chatsGateway.sendMessageToChat(message.chat_id, message);
  }
}
