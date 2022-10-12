import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '../services/bcrypt.service';

describe('BcryptService', () => {
  let bcryptService: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    bcryptService = module.get<BcryptService>(BcryptService);
  });

  describe('hash', () => {
    test('it should be hashed password', async () => {
      const password = 'random';

      const hashed = await bcryptService.hash(password);

      expect(hashed).not.toBe(password);
    });
  });

  describe('compare', () => {
    describe('when the given password does not match', () => {
      test('it should return false', async () => {
        const password = 'random';

        const hashed = await bcryptService.hash(password);

        const result = await bcryptService.compare('wrong-password', hashed);

        expect(result).toBe(false);
      });
    });

    describe('when the given password match', () => {
      test('it should return true', async () => {
        const password = 'random';

        const hashed = await bcryptService.hash(password);

        const result = await bcryptService.compare(password, hashed);

        expect(result).toBe(true);
      });
    });
  });
});
