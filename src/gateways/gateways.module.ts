import { Module } from '@nestjs/common';
import { NotificationsGatewayService } from './services/notifications-gateway.service';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  providers: [NotificationsGateway, NotificationsGatewayService],
})
export class GatewaysModule {}
