import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ChatsGateway } from './chats.gateway';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  providers: [NotificationsGateway, ChatsGateway, SocketAuthGuard, JwtService],
  exports: [NotificationsGateway, ChatsGateway],
})
export class GatewaysModule {}
