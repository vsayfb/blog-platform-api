import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [NotificationsGateway, SocketAuthGuard, JwtService],
  exports: [NotificationsGateway],
})
export class GatewaysModule {}
