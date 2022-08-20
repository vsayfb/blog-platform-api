import { ChatRoutes } from '../src/chats/enums/chat-routes';

jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import { HelpersService } from './helpers/helpers.service';
import { Chat } from '../src/chats/entities/chat.entity';
import { ChatMessages } from '../src/chats/enums/chat-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { ChatViewDto } from '../src/chats/dto/chat-view.dto';
import { AccountMessages } from '../src/accounts/enums/account-messages';
import { randomUUID } from 'crypto';

const PREFIX = '/chats';

describe('Chats (e2e)', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, helpers, moduleRef } =
      await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    server = app.getHttpServer();
  });

  describe('POST create', () => {
    describe('when create is called', () => {
      describe('scenario : an account not found with toID', () => {
        test('should throw Account Not Found error', async () => {
          const chat = await helpersService.createRandomChat(app, randomUUID());

          expect(chat.message).toBe(AccountMessages.NOT_FOUND);
        });
      });

      describe('scenario : if an account found with toID', () => {
        test('should return created chat', async () => {
          const chat = await helpersService.createRandomChat(app);

          expect(chat.message).toBe(ChatMessages.CREATED);
        });
      });

      describe('scenario : if user re-create chat with same toID', () => {
        test('should throw error', async () => {
          const to = await helpersService.loginRandomAccount(app);

          await helpersService.createRandomChat(app, to.user.id);

          const result = await helpersService.createRandomChat(app, to.user.id);

          expect(result.message).toBe(ChatMessages.ALREADY_CREATED);
        });
      });
    });
  });

  describe('GET findMyChats', () => {
    describe('when findMyChats is called', () => {
      let result: { data: Chat[]; message: ChatMessages.ALL_FOUND };

      beforeEach(async () => {
        const chat = await helpersService.createRandomChat(app);

        const response = await request(server)
          .get(PREFIX + ChatRoutes.FIND_MY_CHATS)
          .set('Authorization', chat.initiator.token);

        result = response.body;
      });

      test('should return an array of chats', () => {
        expect(result.message).toEqual(ChatMessages.ALL_FOUND);
      });
    });
  });

  describe('GET findOne', () => {
    describe('when findOne is called', () => {
      describe('scenario : if a chat found with chatID', () => {
        test('should return a chat', async () => {
          const chat = await helpersService.createRandomChat(app);

          const result: { body: { data: ChatViewDto; message: ChatMessages } } =
            await request(server)
              .get(PREFIX + ChatRoutes.FIND_ONE + chat.data.id)
              .set('Authorization', chat.initiator.token);

          expect(result.body.message).toBe(ChatMessages.FOUND);
        });
      });

      describe('scenario : if a chat not found with chatID', () => {
        test('should throw Chat Not Found', async () => {
          const chat = await helpersService.createRandomChat(app);

          const result: { body: { data: ChatViewDto; message: ChatMessages } } =
            await request(server)
              .get(PREFIX + ChatRoutes.FIND_ONE + randomUUID())
              .set('Authorization', chat.initiator.token);

          expect(result.body.message).toBe(ChatMessages.NOT_FOUND);
        });
      });
    });
  });
});
