import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entities/code.entity';
import { VerificationCodesService } from './verification-codes.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode])],
  providers: [VerificationCodesService],
  exports: [VerificationCodesService],
})
export class VerificationCodesModule {}
