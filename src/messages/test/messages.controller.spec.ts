import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from '../messages.controller';
import { MessagesService } from '../messages.service';
import { ChatsService } from '../../chats/chats.service';
import { chatStub } from '../../chats/stub/chat-stub';
import { jwtPayloadStub } from '../../auth/stub/jwt-payload.stub';
import { accountStub } from '../../accounts/test/stub/account.stub';
import { CreateMessageDto } from '../dto/create-message.dto';
import { messageStub } from '../stub/message-stub';
import { MessageMessages } from '../enums/message-messages';

jest.mock('src/chats/chats.service');
jest.mock('src/messages/messages.service');

describe('MessagesController', () => {
  let messagesController: MessagesController;
  let messagesService: MessagesService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [MessagesService, ChatsService],
    }).compile();

    messagesController = moduleRef.get<MessagesController>(MessagesController);
    messagesService = moduleRef.get<MessagesService>(MessagesService);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: {
        data: { chatID: string; content: string };
        message: MessageMessages;
      };
      const sender = jwtPayloadStub();
      const toID = accountStub().id;
      const createMessageDto: CreateMessageDto = {
        content: messageStub().content,
      };
      const chatID = chatStub().id;

      beforeEach(async () => {
        result = await messagesController.create(
          sender,
          createMessageDto,
          chatID,
        );
      });

      test('calls messagesService.create', () => {
        expect(messagesService.create).toHaveBeenCalledWith(
          createMessageDto.content,
          sender.sub,
          chatID,
        );
      });

      it('should return created message', () => {
        expect(result).toEqual({
          data: {
            chatID: chatStub().id,
            content: messageStub().content,
            sender: accountStub(),
            createdAt: messageStub().createdAt,
            updatedAt: messageStub().updatedAt,
          },
          message: MessageMessages.SENT,
        });
      });
    });
  });
});
