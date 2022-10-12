import { Injectable } from '@nestjs/common';
import { IHashManagerService } from '../interfaces/hash-manager-service.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService implements IHashManagerService {
  async hash(text: string, salt?: number): Promise<string> {
    const hash = await bcrypt.hash(text, salt || 10);

    return hash;
  }

  async compare(text: string, hashedText: string): Promise<boolean> {
    return await bcrypt.compare(text, hashedText);
  }
}
