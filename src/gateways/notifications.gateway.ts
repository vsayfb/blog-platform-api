import { WebSocketGateway } from '@nestjs/websockets';
import { NotificationsGatewayService } from './services/notifications-gateway.service';

@WebSocketGateway({ namespace: 'notifications' })
export class NotificationsGateway {
  constructor(private readonly gatewaysService: NotificationsGatewayService) {}
}
