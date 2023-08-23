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
import { AccountNotification } from 'src/resources/account_notifications/entities/account-notification.entity';
import { JwtPayload } from 'src/lib/jwt.payload';
import { LoggingService } from 'src/logging/logging.service';

dotenv.config();

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: process.env[ProcessEnv.SECURE_HOST] },
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
  handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token?.split(' ')[1];

    const user = this.verifySocket(token);

    if (user) this.sockets.push({ socketID: socket.id, userID: user.sub });
  }

  handleDisconnect(socket: Socket) {
    this.sockets = this.sockets.filter((s) => s.socketID !== socket.id);

    socket.disconnect();
  }

  private verifySocket(token: string): JwtPayload | false {
    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: process.env[ProcessEnv.JWT_SECRET],
      });

      return payload;
    } catch (error) {
      return false;
    }
  }

  private async getSenderSocket(senderID: string): Promise<Socket> {
    const sockets = await this.server.fetchSockets();

    const socket = this.sockets.find((s) => s.userID === senderID);

    if (!socket) return null;

    return sockets.find((s) => s.id === socket.socketID) as unknown as Socket;
  }

  private getNotifableSocketID(userID: string): string {
    const socket = this.sockets.find((s) => s.userID === userID);

    return socket?.socketID;
  }

  async pushNotification(notification: AccountNotification) {
    const senderSocket = await this.getSenderSocket(notification.sender.id);

    //
    if (!senderSocket) {
      return;
    }

    const notifableSocketID = this.getNotifableSocketID(
      notification.notifable.id,
    );

    if (!notifableSocketID) return;

    delete notification.notifable;

    senderSocket.to(notifableSocketID).emit('notification', notification);
  }

  get socketCount() {
    return this.sockets.length;
  }
}
