import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import * as dotenv from 'dotenv';
import { ProcessEnv } from 'src/lib/enums/env';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Notification } from 'src/global/notifications/entities/notification.entity';
import { JwtPayload } from 'src/lib/jwt.payload';

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
  handleConnection(client: Socket) {
    const token = client.handshake.auth.token?.split(' ')[1];

    const user = this.verifySocket(token);

    if (user) this.sockets.push({ socketID: client.id, userID: user.sub });
  }

  handleDisconnect(client: Socket) {
    this.sockets = this.sockets.filter((s) => s.socketID !== client.id);
  }

  private verifySocket(token: string): JwtPayload | false {
    try {
      this.jwtService.verify(token, {
        secret: process.env[ProcessEnv.JWT_SECRET],
      });
    } catch (error) {
      return false;
    }
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
