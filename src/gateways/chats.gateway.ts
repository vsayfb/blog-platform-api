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
import { NewMessageDto } from '../messages/response-dto/message-view.dto';

@WebSocketGateway({
  namespace: 'chats',
  cors: { origin: process.env[ProcessEnv.SECURE_HOST] },
})
export class ChatsGateway {
  @WebSocketServer() private server: Server;

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('chat')
  handleChat(@MessageBody() chatID: string, @ConnectedSocket() client: Socket) {
    client.join(chatID);

    client.emit('joined', chatID);
  }

  sendMessageToChat(chatID: string, message: NewMessageDto) {
    this.server.to(chatID).emit('message', message);
  }
}
