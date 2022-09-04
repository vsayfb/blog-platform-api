import { Test, TestingModule } from '@nestjs/testing';
import { ChatsGateway } from '../chats.gateway';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
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
      let result: void;

      const chatID = randomUUID();
      const socket = { join: () => 0, emit: () => 'joined' };

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
