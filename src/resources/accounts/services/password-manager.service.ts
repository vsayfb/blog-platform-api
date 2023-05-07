import { Injectable } from '@nestjs/common';
import { HashManagerService } from 'src/global/hash-manager/services/hash-manager.service';

@Injectable()
export class PasswordManagerService {
  private readonly salt = 10;

  constructor(private readonly hashManagerService: HashManagerService) {}

  async hashPassword(password: string) {
    return this.hashManagerService.manager.hash(password, this.salt);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return this.hashManagerService.manager.compare(password, hashedPassword);
  }
}
