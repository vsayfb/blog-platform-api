import { Test, TestingModule } from '@nestjs/testing';
import { IHashManagerService } from '../interfaces/hash-manager-service.interface';
import { BcryptService } from '../services/bcrypt.service';
import { HashManagerService } from '../services/hash-manager.service';

describe('HashManagerService', () => {
  let hashManagerService: HashManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashManagerService,
        { provide: IHashManagerService, useClass: BcryptService },
      ],
    }).compile();

    hashManagerService = module.get<HashManagerService>(HashManagerService);
  });

  describe('hash', () => {
    test('it should be hashed password', async () => {
      const password = 'random';

      const hashed = await hashManagerService.manager.hash(password);

      expect(hashed).not.toBe(password);
    });
  });

  describe('compare', () => {
    describe('when the given password does not match', () => {
      test('it should return false', async () => {
        const password = 'random';

        const hashed = await hashManagerService.manager.hash(password);

        const result = await hashManagerService.manager.compare(
          'wrong-password',
          hashed,
        );

        expect(result).toBe(false);
      });
    });

    describe('when the given password match', () => {
      test('it should return true', async () => {
        const password = 'random';

        const hashed = await hashManagerService.manager.hash(password);

        const result = await hashManagerService.manager.compare(
          password,
          hashed,
        );

        expect(result).toBe(true);
      });
    });
  });
});
