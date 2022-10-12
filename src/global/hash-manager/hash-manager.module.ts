import { Global, Module } from '@nestjs/common';
import { IHashManagerService } from './interfaces/hash-manager-service.interface';
import { BcryptService } from './services/bcrypt.service';
import { HashManagerService } from './services/hash-manager.service';

@Global()
@Module({
  providers: [
    HashManagerService,
    { provide: IHashManagerService, useClass: BcryptService },
  ],
  exports: [HashManagerService],
})
export class HashManagerModule {}
