import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatsGateway } from 'src/gateways/chats.gateway';
import { NotificationsService } from 'src/account_notifications/services/notifications.service';
import { notificationStub } from 'src/account_notifications/stub/notification-stub';
import { MessageViewDto } from 'src/messages/response-dto/message-view.dto';
import { messageStub } from 'src/messages/stub/message-stub';
import { SocketAuthGuard } from '../../../gateways/guards/socket-auth.guard';
import { NotificationsGateway } from '../../../gateways/notifications.gateway';
import { GatewayEventsService } from '../gateway-events.service';

jest.mock('src/global/notifications/services/notifications.service');
jest.mock('src/gateways/notifications.gateway');
jest.mock('src/gateways/chats.gateway');

describe('GatewayEventsService', () => {
  let gatewayEventsService: GatewayEventsService;
  let notificationsGateway: NotificationsGateway;
  let notificationsService: NotificationsService;
  let chatsGateway: ChatsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayEventsService,
        NotificationsService,
        NotificationsGateway,
        ChatsGateway,
        { provide: SocketAuthGuard, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    gatewayEventsService =
      module.get<GatewayEventsService>(GatewayEventsService);

    notificationsService =
      module.get<NotificationsService>(NotificationsService);

    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);

    chatsGateway = module.get<ChatsGateway>(ChatsGateway);
  });

  describe('newNotification', () => {
    describe('when newNotification is called', () => {
      let result: void;

      const notification = notificationStub();

      beforeEach(async () => {
        result = await gatewayEventsService.newNotification(notification.id);
      });

      test('calls notificationsService.getOneByID', () => {
        expect(notificationsService.getOneByID).toHaveBeenCalledWith(
          notification.id,
        );
      });

      test('calls notificationsGateway.pushNotification', () => {
        expect(notificationsGateway.pushNotification).toHaveBeenCalledWith(
          notification,
        );
      });

      it('should return undefined (void)', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('newMessage', () => {
    describe('when newMessage is called', () => {
      let result: void;

      const message: MessageViewDto = {
        chatID: messageStub().chat.id,
        ...messageStub(),
      };

      beforeEach(() => {
        result = gatewayEventsService.newMessage(message);
      });

      test('calls chatsGateway.sendMessageToChat', () => {
        expect(chatsGateway.sendMessageToChat).toHaveBeenCalledWith(
          message.chatID,
          message,
        );
      });

      it('should return undefined (void)', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
