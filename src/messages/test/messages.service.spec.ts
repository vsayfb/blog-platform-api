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
import { Account } from 'src/accounts/entities/account.entity';

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
      let result: { chatID: string; content: string; sender: Account };

      const createMessageDto: CreateMessageDto = {
        content: messageStub().content,
      };
      const initiatorID = jwtPayloadStub().sub;
      const toID = accountStub().id;

      describe('scenario : if chat id did not receive', () => {
        beforeEach(async () => {
          jest.spyOn(chatsService, 'getOneByID').mockResolvedValueOnce(null);

          result = await messagesService.create(
            createMessageDto,
            initiatorID,
            toID,
          );
        });

        test('calls chatsService.getOneByID method with undefined', () => {
          expect(chatsService.getOneByID).toHaveBeenCalledWith(undefined);
        });

        test('calls chatsService.create method', () => {
          expect(chatsService.create).toHaveBeenCalledWith({
            initiatorID,
            toID,
          });
        });

        test('calls chatsService.addMessageToChat', () => {
          expect(chatsService.addMessageToChat).toHaveBeenCalledWith(
            chatStub(),
            { ...messageStub(), sender: { id: expect.any(String) } },
          );
        });

        test('calls messagesRepository.findOne', () => {
          expect(messagesRepository.findOne).toHaveBeenCalledWith({
            where: { id: messageStub().id },
            relations: { sender: true },
          });
        });

        it('should return the created message', () => {
          expect(result).toEqual({
            chatID: chatStub().id,
            content: createMessageDto.content,
            sender: accountStub(),
          });
        });
      });

      describe('scenario : if chat id received', () => {
        const chatID = chatStub().id;

        beforeEach(async () => {
          result = await messagesService.create(
            createMessageDto,
            initiatorID,
            toID,
            chatID,
          );
        });

        test('calls chatsService.getOneByID method with chatID', () => {
          expect(chatsService.getOneByID).toHaveBeenCalledWith(chatID);
        });

        test('calls messagesRepository.save method', () => {
          expect(messagesRepository.save).toHaveBeenCalledWith({
            chat: chatStub(),
            sender: { id: initiatorID },
            content: createMessageDto.content,
          });
        });

        test('calls chatsService.addMessageToChat', () => {
          expect(chatsService.addMessageToChat).toHaveBeenCalledWith(
            chatStub(),
            { ...messageStub(), sender: { id: expect.any(String) } },
          );
        });

        test('calls messagesRepository.findOne', () => {
          expect(messagesRepository.findOne).toHaveBeenCalledWith({
            where: { id: messageStub().id },
            relations: { sender: true },
          });
        });

        it('should return the created message', () => {
          expect(result).toEqual({
            chatID: chatStub().id,
            content: createMessageDto.content,
            sender: accountStub(),
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
