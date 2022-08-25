import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ChatsGateway } from './chats.gateway';

@Module({
  providers: [NotificationsGateway, ChatsGateway, SocketAuthGuard, JwtService],
  exports: [NotificationsGateway, ChatsGateway],
})
export class GatewaysModule {}
