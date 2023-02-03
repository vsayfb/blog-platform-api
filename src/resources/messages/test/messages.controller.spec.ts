import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from '../messages.controller';
import { MessagesService } from '../messages.service';
import { ChatsService } from '../../chats/chats.service';
import { chatStub } from '../../chats/stub/chat-stub';
import { jwtPayloadStub } from '../../auth/stub/jwt-payload.stub';
import { accountStub } from '../../accounts/test/stub/account.stub';
import { CreateMessageDto } from '../request-dto/create-message.dto';
import { messageStub } from '../stub/message-stub';
import { MessageMessages } from '../enums/message-messages';
import { GatewayEventsService } from 'src/global/events/gateway-events.service';

jest.mock('src/chats/chats.service');
jest.mock('src/messages/messages.service');
jest.mock('src/global/events/gateway-events.service');

describe('MessagesController', () => {
  let messagesController: MessagesController;
  let messagesService: MessagesService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [MessagesService, ChatsService, GatewayEventsService],
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
        expect(messagesService.create).toHaveBeenCalledWith({
          initiatorID: sender.sub,
          chatID: chatID,
          content: createMessageDto.content,
        });
      });

      it('should return created message', () => {
        expect(result).toEqual({
          data: {
            chatID: chatStub().id,
            content: messageStub().content,
            sender: accountStub(),
            created_at: messageStub().created_at,
            updated_at: messageStub().updated_at,
          },
          message: MessageMessages.SENT,
        });
      });
    });
  });
});
