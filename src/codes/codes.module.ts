import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './entities/code.entity';
import { CodesService } from './codes.service';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Code]), AccountsModule],
  providers: [CodesService],
  exports: [CodesService],
})
export class CodesModule {}
