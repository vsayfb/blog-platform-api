import { Inject, Injectable } from '@nestjs/common';
import { IHashManagerService } from '../interfaces/hash-manager-service.interface';

@Injectable()
export class HashManagerService {
  constructor(
    @Inject(IHashManagerService) public readonly manager: IHashManagerService,
  ) {}
}
