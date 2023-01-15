import { Global, Module } from '@nestjs/common';
import { CacheManagerModule } from 'src/cache/cache-manager.module';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { AccountsNotificationsModule } from '../../account_notifications/account-notifications.module';
import { GatewayEventsService } from './gateway-events.service';

@Global()
@Module({
  imports: [GatewaysModule, AccountsNotificationsModule, CacheManagerModule],
  providers: [GatewayEventsService],
  exports: [GatewayEventsService],
})
export class EventsModule {}
