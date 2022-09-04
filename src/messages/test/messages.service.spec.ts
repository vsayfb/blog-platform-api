import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from '../messages.service';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/utils/mockRepository';
import { ChatsService } from '../../chats/chats.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { messageStub } from '../stub/message-stub';
import { accountStub } from '../../accounts/test/stub/account.stub';
import { jwtPayloadStub } from '../../auth/stub/jwt-payload.stub';
import { chatStub } from '../../chats/stub/chat-stub';
import { ChatMessages } from '../../chats/enums/chat-messages';
import { MessageViewDto } from '../dto/message-view.dto';

jest.mock('src/chats/chats.service');

describe('MessagesService', () => {
  let messagesService: MessagesService;
  let chatsService: ChatsService;
  let messagesRepository: Repository<Message>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        ChatsService,
        { provide: getRepositoryToken(Message), useClass: Repository<Message> },
      ],
    }).compile();

    messagesService = moduleRef.get<MessagesService>(MessagesService);

    chatsService = moduleRef.get<ChatsService>(ChatsService);

    messagesRepository = moduleRef.get<Repository<Message>>(
      getRepositoryToken(Message),
    );

    mockRepository(messagesRepository, Message);
  });

  describe('create', () => {
    describe('when create is called', () => {
      const createMessageDto: CreateMessageDto = {
        content: messageStub().content,
      };
      const initiatorID = jwtPayloadStub().sub;
      const chatID = chatStub().id;

      beforeEach(() => {
        messagesService.create(createMessageDto.content, initiatorID, chatID);
      });

      test('calls chatsService.getOneByID', () => {
        expect(chatsService.getOneByID).toHaveBeenCalledWith(chatID);
      });

      describe('when chatsService.getOneByID is called', () => {
        describe('scenario : if chat is not found', () => {
          test('should throw Chat Not Found', async () => {
            jest.spyOn(chatsService, 'getOneByID').mockResolvedValueOnce(null);

            await expect(
              messagesService.create(
                createMessageDto.content,
                initiatorID,
                chatID,
              ),
            ).rejects.toThrow(ChatMessages.NOT_FOUND);
          });
        });

        describe('scenario : if chat is found', () => {
          let result: MessageViewDto;

          beforeEach(async () => {
            result = await messagesService.create(
              createMessageDto.content,
              initiatorID,
              chatID,
            );
          });

          test('calls messagesRepository.save', async () => {
            expect(messagesRepository.save).toHaveBeenCalledWith({
              chat: chatStub(),
              sender: { id: initiatorID },
              content: createMessageDto.content,
            });
          });

          test('calls messagesRepository.findOne', async () => {
            expect(messagesRepository.findOne).toHaveBeenCalledWith({
              where: { id: messageStub().id },
              relations: { sender: true },
            });
          });

          it('should return the message', () => {
            expect(result).toEqual({
              chatID: chatStub().id,
              content: messageStub().content,
              sender: accountStub(),
              created_at: messageStub().created_at,
              updated_at: messageStub().updated_at,
            });
          });
        });
      });
    });
  });

  describe('getAccountMessages', () => {
    describe('when getAccountMessages is called', () => {
      let result: Message[];
      const senderID = jwtPayloadStub().sub;

      beforeEach(async () => {
        result = await messagesService.getAccountMessages(senderID);
      });

      test('calls messagesRepository.find', () => {
        expect(messagesRepository.find).toHaveBeenCalledWith({
          where: { sender: { id: senderID } },
        });
      });

      it('should return an array of messages', () => {
        expect(result).toEqual([messageStub()]);
      });
    });
  });
});
