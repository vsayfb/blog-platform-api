import { UnauthorizedException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { NotificationsGatewayService } from './services/notifications-gateway.service';
import * as dotenv from 'dotenv';
import { ProcessEnv } from 'src/lib/enums/env';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Notification } from 'src/notifications/entities/notification.entity';

dotenv.config();

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: process.env[ProcessEnv.CORS_ORIGIN] },
})
@UseGuards(SocketAuthGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // socket-id - account-id
  private sockets: { userID: string; socketID: string }[] = [];

  @WebSocketServer()
  private server: Server;

  constructor(private readonly jwtService: JwtService) {}

  //  A guard is not usable to prevent unauthorized users from establishing a connection.
  //  https://github.com/nestjs/nest/issues/882
  handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.auth.token?.split(' ')[1];

    try {
      const user = this.verifySocket(token);

      this.sockets.push({ socketID: client.id, userID: user.sub });
    } catch (error) {
      return false;
    }
  }

  handleDisconnect(client: Socket) {
    this.sockets = this.sockets.filter((s) => s.socketID !== client.id);
  }

  private verifySocket(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env[ProcessEnv.JWT_SECRET],
    });
  }

  private async getSenderSocket(senderID: string): Promise<Socket> {
    const sockets = await this.server.fetchSockets();

    return sockets.find((s) => s.id === senderID) as unknown as Socket;
  }

  private getNotifableSocketID(userID: string): string {
    const socket = this.sockets.find((s) => s.userID === userID);

    return socket.socketID;
  }

  async pushNotification(notification: Notification) {
    const senderSocket = await this.getSenderSocket(notification.sender.id);

    const notifableSocketID = this.getNotifableSocketID(
      notification.notifable.id,
    );

    const { sender, notifable, ...dto } = notification;

    senderSocket.to(notifableSocketID).emit('notification', dto);
  }
}
