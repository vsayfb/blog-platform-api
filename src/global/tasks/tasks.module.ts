import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
