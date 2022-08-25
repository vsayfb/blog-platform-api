import { Test, TestingModule } from '@nestjs/testing';
import { GatewayEventsService } from '../../global/events/gateway-events.service';
import { ChatsGateway } from '../chats.gateway';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { NotificationsGateway } from '../notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../../global/notifications/services/notifications.service';
import { ConfigService } from '@nestjs/config';

jest.mock('src/global/notifications/services/notifications.service');

describe('ChatsGateway', () => {
  let chatsGateway: ChatsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsGateway,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    chatsGateway = module.get<ChatsGateway>(ChatsGateway);
  });

  describe('handleChat', () => {
    describe('when handleChat is called', () => {
      let result;
      const chatID = randomUUID();
      const socket = { join: (roomId: string) => 0 };

      beforeEach(() => {
        jest.spyOn(socket, 'join');
        result = chatsGateway.handleChat(chatID, socket as unknown as Socket);
      });

      test('calls join method', () => {
        expect(socket.join).toHaveBeenCalledWith(chatID);
      });

      it('should return falsy', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
