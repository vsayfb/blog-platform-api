import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from '../chats.service';
import { ArrayContains, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/utils/mockRepository';
import { AccountsService } from '../../accounts/accounts.service';
import { accountStub } from '../../accounts/test/stub/account.stub';
import { randomUUID } from 'crypto';
import { AccountMessages } from '../../accounts/enums/account-messages';
import { chatStub } from '../stub/chat-stub';
import { jwtPayloadStub } from '../../auth/stub/jwt-payload.stub';
import { Message } from '../../messages/entities/message.entity';

jest.mock('src/accounts/accounts.service');

describe('ChatsService', () => {
  let chatsService: ChatsService;
  let chatsRepository: Repository<Chat>;
  let messagesRepository: Repository<Message>;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        AccountsService,
        { provide: getRepositoryToken(Chat), useClass: Repository<Chat> },
        { provide: getRepositoryToken(Message), useClass: Repository<Message> },
      ],
    }).compile();

    chatsService = moduleRef.get<ChatsService>(ChatsService);
    chatsRepository = moduleRef.get<Repository<Chat>>(getRepositoryToken(Chat));
    messagesRepository = moduleRef.get<Repository<Message>>(
      getRepositoryToken(Message),
    );

    accountsService = moduleRef.get<AccountsService>(AccountsService);

    mockRepository(chatsRepository, Chat);
    mockRepository(messagesRepository, Message);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(chatsService, 'checkChatExists' as any)
        .mockResolvedValue(false);
    });

    describe('when create is called', () => {
      let result;
      const initiator = accountStub();
      const toID = randomUUID();
      const firstMessage = 'random-message';

      beforeEach(async () => {
        result = await chatsService.create({
          initiatorID: initiator.id,
          toID,
          firstMessage,
        });
      });

      test('calls accountService.getOneByID with initiatorID', () => {
        expect(accountsService.getOneByID).toHaveBeenCalledWith(initiator.id);
      });

      test('calls accountService.getOneByID with toID', () => {
        expect(accountsService.getOneByID).toHaveBeenCalledWith(toID);
      });

      describe('scenario : if an account is found with toID', () => {
        test('calls this.checkChatExists', () => {
          //@ts-ignore ->  private method
          expect(chatsService.checkChatExists).toHaveBeenCalledWith([
            initiator.id,
            toID,
          ]);
        });

        test('calls chatsRepository.save', () => {
          expect(chatsRepository.save).toHaveBeenCalledWith({
            members: [accountStub(), accountStub()],
          });
        });

        test('calls messagesRepository.save', () => {
          expect(messagesRepository.save).toHaveBeenCalled();
        });

        test('calls chatsRepository.findOne', () => {
          expect(chatsRepository.findOne).toHaveBeenCalledWith({
            where: { id: chatStub().id },
            relations: { messages: true, members: true },
          });
        });

        it('should return the created chat', () => {
          expect(result).toEqual(chatStub());
        });
      });

      describe('scenario : if an account is not found with toID', () => {
        beforeEach(() =>
          jest.spyOn(accountsService, 'getOneByID').mockResolvedValue(null),
        );

        test('throws Account Not Found error', async () => {
          await expect(
            chatsService.create({
              initiatorID: initiator.id,
              toID,
              firstMessage,
            }),
          ).rejects.toThrow(AccountMessages.NOT_FOUND);
        });
      });
    });
  });

  describe('getAccountChats', () => {
    let result;
    const memberID = jwtPayloadStub().sub;

    describe('when getAccountChats is called', () => {
      beforeEach(async () => {
        result = await chatsService.getAccountChats(memberID);
      });

      test('calls chatsRepository.find', () => {
        expect(chatsRepository.find).toHaveBeenCalledWith({
          relations: { members: true },
        });
      });

      it('should return an array of chats', () => {
        expect(result).toEqual([chatStub()]);
      });
    });
  });

  describe('getOne', () => {
    let result: Chat;
    const memberID = jwtPayloadStub().sub;
    const chatID = chatStub().id;

    describe('when getOne is called', () => {
      beforeEach(async () => {
        result = await chatsService.getOne(memberID, chatID);
      });

      test('calls chatsRepository.findOne', () => {
        expect(chatsRepository.findOne).toHaveBeenCalledWith({
          where: { id: chatID, members: ArrayContains([memberID]) },
          relations: { members: true, messages: true },
        });
      });

      it('should return a chat', () => {
        expect(result).toEqual(chatStub());
      });
    });
  });

  describe('getOneByID', () => {
    let result;
    const chatID = chatStub().id;

    describe('when getOneByID is called', () => {
      beforeEach(async () => {
        result = await chatsService.getOneByID(chatID);
      });

      test('calls chatsRepository.findOne', () => {
        expect(chatsRepository.findOne).toHaveBeenCalledWith({
          where: { id: chatID },
          relations: { members: true },
        });
      });

      it('should return a chat', () => {
        expect(result).toEqual(chatStub());
      });
    });
  });
});
