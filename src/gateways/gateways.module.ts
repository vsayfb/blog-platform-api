import { Global, Module } from '@nestjs/common';
import { NotificationsGatewayService } from './services/notifications-gateway.service';
import { NotificationsGateway } from './notifications.gateway';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  providers: [
    NotificationsGateway,
    NotificationsGatewayService,
    SocketAuthGuard,
    JwtService,
  ],
  exports: [NotificationsGatewayService],
})
export class GatewaysModule {}
