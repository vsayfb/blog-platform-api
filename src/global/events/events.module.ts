import { Global, Module } from '@nestjs/common';
import { GatewaysModule } from 'src/gateways/gateways.module';
import { GatewayEventsService } from './gateway-events.service';

@Global()
@Module({
  imports: [GatewaysModule],
  providers: [GatewayEventsService],
  exports: [GatewayEventsService],
})
export class EventsModule {}
