import { INestApplication } from '@nestjs/common';
import { initializeEndToEndTestModule } from '../helpers/utils/initializeEndToEndTestModule';
import { HelpersService } from '../helpers/helpers.service';
import { DatabaseUser } from '../helpers/database/database.service';
import { io, Socket } from 'socket.io-client';
import { ChatMessages } from '../../src/chats/enums/chat-messages';
import { MessageViewDto } from '../../src/messages/dto/message-view.dto';

jest.setTimeout(30000);

describe('ChatsGateway', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let appUrl: string;

  beforeAll(async () => {
    const { moduleRef, nestApp } = await initializeEndToEndTestModule();

    app = nestApp;

    const { address, port } = app.getHttpServer().listen().address();

    appUrl = `http://[${address}]:${port}`;

    helpersService = moduleRef.get<HelpersService>(HelpersService);
  });

  function initializeClientSocket(token?: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const socket = io(`${appUrl}/chats`, {
        auth: { token },
      });

      socket.on('connect', () => {
        resolve(socket);
      });

      socket.on('connect_error', (reason) => {
        reject(reason);
      });
    });
  }

  function destroyClientSocket(socket: Socket) {
    return new Promise((resolve, reject) => {
      socket.disconnect();

      if (socket.disconnected) resolve(true);
      else reject('Error');
    });
  }

  describe('sendMessageToChat', () => {
    describe('when sendMessageToChat is called', () => {
      describe('scenario : if user has a token', () => {
        let account: {
          token: string;
          user: DatabaseUser;
        };

        let clientSocket: Socket;

        let chat: {
          initiator: { token: string; user: DatabaseUser };
          data: { id: string; content: string };
          message: ChatMessages;
        };

        beforeEach(async () => {
          account = await helpersService.loginRandomAccount(app);

          clientSocket = await initializeClientSocket(account.token);

          chat = await helpersService.createRandomChat(app);

          clientSocket.emit('chat', chat.data.id);
        });

        afterEach(async () => {
          await destroyClientSocket(clientSocket);
        });

        test('should push message to client', async () => {
          const messageContent = 'hi there';

          clientSocket.on('message', (data: MessageViewDto) => {
            expect(data.content).toBe(messageContent);
          });

          await helpersService.createMessage(
            app,
            chat.data.id,
            chat.initiator.token,
            messageContent,
          );
        });
      });
    });
  });
});
