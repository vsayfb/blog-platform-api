import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ProcessEnv } from '../lib/enums/env';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { MessageViewDto } from '../messages/dto/message-view.dto';

@WebSocketGateway({
  namespace: 'chats',
  cors: { origin: process.env[ProcessEnv.CORS_ORIGIN] },
})
export class ChatsGateway {
  @WebSocketServer() private server: Server;

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('chat')
  handleChat(@MessageBody() chatID: string, @ConnectedSocket() client: Socket) {
    client.join(chatID);

    client.emit('joined', chatID);
  }

  sendMessageToChat(chatID: string, message: MessageViewDto) {
    this.server.to(chatID).emit('message', message);
  }
}
