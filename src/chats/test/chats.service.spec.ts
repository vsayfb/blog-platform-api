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
import { messageStub } from '../../messages/stub/message-stub';

jest.mock('src/accounts/accounts.service');

describe('ChatsService', () => {
  let chatsService: ChatsService;
  let chatsRepository: Repository<Chat>;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        AccountsService,
        { provide: getRepositoryToken(Chat), useClass: Repository<Chat> },
      ],
    }).compile();

    chatsService = moduleRef.get<ChatsService>(ChatsService);
    chatsRepository = moduleRef.get<Repository<Chat>>(getRepositoryToken(Chat));
    accountsService = moduleRef.get<AccountsService>(AccountsService);

    mockRepository(chatsRepository, Chat);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    describe('when create is called', () => {
      let result;
      const initiatorID = accountStub().id;
      const toID = randomUUID();

      beforeEach(async () => {
        result = await chatsService.create({ initiatorID, toID });
      });

      test('calls accountService.getOne with initiatorID', () => {
        expect(accountsService.getOne).toHaveBeenCalledWith(initiatorID);
      });

      test('calls accountService.getOne with toID', () => {
        expect(accountsService.getOne).toHaveBeenCalledWith(initiatorID);
      });

      describe('scenario : if an account found with toID', () => {
        test('calls chatsRepository.save', () => {
          expect(chatsRepository.save).toHaveBeenCalledWith({
            members: [accountStub(), accountStub()],
          });
        });

        test('calls chatsRepository.findOne', () => {
          expect(chatsRepository.findOne).toHaveBeenCalledWith({
            where: { id: chatStub().id },
          });
        });

        it('should return the created chat', () => {
          expect(result).toEqual(chatStub());
        });
      });

      describe('scenario : if an account not found with toID', () => {
        beforeEach(() =>
          jest.spyOn(accountsService, 'getOne').mockResolvedValue(null),
        );

        test('throws Account Not Found error', async () => {
          await expect(
            chatsService.create({ initiatorID, toID }),
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
          where: { members: ArrayContains([memberID]) },
        });
      });

      it('should return an array of chats', () => {
        expect(result).toEqual([chatStub()]);
      });
    });
  });

  describe('findOne', () => {
    let result;
    const memberID = jwtPayloadStub().sub;
    const chatID = chatStub().id;

    describe('when findOne is called', () => {
      beforeEach(async () => {
        result = await chatsService.findOne(memberID, chatID);
      });

      test('calls chatsRepository.findOne', () => {
        expect(chatsRepository.findOne).toHaveBeenCalledWith({
          where: { id: chatID, members: ArrayContains([memberID]) },
          relations: { members: true },
        });
      });

      it('should return a chat', () => {
        expect(result).toEqual(chatStub());
      });
    });
  });

  describe('addMessageToChat', () => {
    describe('when addMessageToChat is called', () => {
      let result: void;
      const chat = chatStub();
      const message = messageStub();

      beforeEach(async () => {
        result = await chatsService.addMessageToChat(chat, message);
      });

      test('calls chatsRepository.save', () => {
        expect(chatsRepository.save).toHaveBeenCalledWith(chat);
      });

      it('should return undefined (void)', () => {
        expect(result).toBeUndefined();
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
