import { Global, Module } from '@nestjs/common';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { AccountsNotificationsModule } from '../../account_notifications/account-notifications.module';
import { GatewayEventsService } from './gateway-events.service';

@Global()
@Module({
  imports: [GatewaysModule, AccountsNotificationsModule],
  providers: [GatewayEventsService],
  exports: [GatewayEventsService],
})
export class EventsModule {}
