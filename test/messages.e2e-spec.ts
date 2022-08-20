import { randomUUID } from 'crypto';

jest.setTimeout(30000);

import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import { INestApplication } from '@nestjs/common';
import { HelpersService } from './helpers/helpers.service';
import * as request from 'supertest';
import { CreateMessageDto } from '../src/messages/dto/create-message.dto';
import { MessageRoutes } from '../src/messages/enums/message-routes';
import { MessageViewDto } from '../src/messages/dto/message-view.dto';
import { MessageMessages } from '../src/messages/enums/message-messages';
import { ChatMessages } from '../src/chats/enums/chat-messages';

const PREFIX = '/messages';

describe('Messages (e2e)', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, helpers, moduleRef } =
      await initializeEndToEndTestModule();

    app = nestApp;
    server = app.getHttpServer();
    helpersService = helpers;
  });

  async function createMessage(chatID: string) {
    const sender = await helpersService.loginRandomAccount(app);

    const to = await helpersService.loginRandomAccount(app);

    const dto: CreateMessageDto = {
      content: 'random-comment',
    };

    const result: { body: { data: MessageViewDto; message: MessageMessages } } =
      await request(server)
        .post(`${PREFIX}${MessageRoutes.CREATE}${to.user.id}?chatID=${chatID}`)
        .set('Authorization', sender.token)
        .send(dto);

    return result.body;
  }

  describe('POST create', () => {
    let result;

    describe('when create is called', () => {
      describe('scenario : if chat is not found', () => {
        test('should throw Chat Not Found', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const result = await request(server)
            .post(PREFIX + MessageRoutes.CREATE + randomUUID())
            .set('Authorization', user.token);

          expect(result.body.message).toBe(ChatMessages.NOT_FOUND);
        });
      });

      describe("scenario : if user is chat's initiator", () => {
        test('should return the message', async () => {
          const chat = await helpersService.createRandomChat(app);

          const result = await request(server)
            .post(PREFIX + MessageRoutes.CREATE + chat.data.id)
            .set('Authorization', chat.initiator.token)
            .send({ content: 'random-comment' });

          expect(result.body.message).toBe(MessageMessages.SENT);
        });
      });
    });
  });
});
