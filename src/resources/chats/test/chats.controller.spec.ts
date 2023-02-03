import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from '../chats.controller';
import { ChatsService } from '../chats.service';
import { jwtPayloadStub } from '../../auth/stub/jwt-payload.stub';
import { Chat } from '../entities/chat.entity';
import { chatStub } from '../stub/chat-stub';
import { ChatMessages } from '../enums/chat-messages';
import { ChatViewDto } from '../response-dto/account-chat.dto';

jest.mock('src/chats/chats.service');

describe('ChatsController', () => {
  let chatsController: ChatsController;
  let chatsService: ChatsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [ChatsService],
    }).compile();

    chatsController = moduleRef.get<ChatsController>(ChatsController);
    chatsService = moduleRef.get<ChatsService>(ChatsService);
  });

  describe('findClientChats', () => {
    describe('when findClientChats is called', () => {
      let result: { data: ChatViewDto[]; message: ChatMessages };
      const me = jwtPayloadStub();

      beforeEach(async () => {
        result = await chatsController.findClientChats(me);
      });

      test('calls chatsService.getAccountChats', () => {
        expect(chatsService.getAccountChats).toHaveBeenCalledWith(me.sub);
      });

      it('should return an array of chats', () => {
        expect(result).toEqual({
          data: [chatStub()],
          message: ChatMessages.ALL_FOUND,
        });
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let result: { data: Chat; message: string };
      const me = jwtPayloadStub();
      const chatID = chatStub().id;

      beforeEach(async () => {
        result = await chatsController.findOne(chatID, me);
      });

      test('calls chatsService.getOne', () => {
        expect(chatsService.getOne).toHaveBeenCalledWith(me.sub, chatID);
      });

      it('should return a chat', () => {
        expect(result).toEqual({
          data: chatStub(),
          message: ChatMessages.FOUND,
        });
      });
    });
  });
});
