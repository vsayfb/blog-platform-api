import { Test } from '@nestjs/testing';
import { HashManagerService } from 'src/global/hash-manager/services/hash-manager.service';
import { hashStub } from 'src/global/hash-manager/test/stub/hash.stub';
import { PasswordManagerService } from '../services/password-manager.service';

jest.mock('src/global/hash-manager/services/hash-manager.service.ts');

describe('PasswordManagerService', () => {
  let passwordManagerService: PasswordManagerService;
  let hashManagerService: HashManagerService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PasswordManagerService, HashManagerService],
    }).compile();

    passwordManagerService = module.get<PasswordManagerService>(
      PasswordManagerService,
    );

    hashManagerService = module.get<HashManagerService>(HashManagerService);
  });

  describe('hashPassword', () => {
    describe('when hashPassword is called', () => {
      let result: string;

      const password = hashStub().text;

      beforeEach(async () => {
        result = await passwordManagerService.hashPassword(password);
      });

      test('calls hashManagerService.manage.hash', () => {
        expect(hashManagerService.manager.hash).toHaveBeenCalled();
      });

      test('should return hashed password', () => {
        expect(result).toBe(hashStub().hashedText);
      });
    });
  });

  describe('comparePassword', () => {
    describe('when comparePassword is called', () => {
      let result: boolean;
      const password = hashStub().text;
      const hashedPassword = hashStub().hashedText;

      describe('scenario : the given password matches', () => {
        beforeEach(async () => {
          result = await passwordManagerService.comparePassword(
            password,
            hashedPassword,
          );
        });

        test('calls hashManagerService.manager.compare', () => {
          expect(hashManagerService.manager.compare).toHaveBeenCalled();
        });

        test('should return true', () => {
          expect(result).toBe(true);
        });
      });

      describe('scenario : the given password does not match', () => {
        beforeEach(async () => {
          jest
            .spyOn(hashManagerService.manager, 'compare')
            .mockResolvedValue(false);

          result = await passwordManagerService.comparePassword(
            password,
            hashedPassword,
          );
        });

        test('calls hashManagerService.manager.compare', () => {
          expect(hashManagerService.manager.compare).toHaveBeenCalled();
        });

        test('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });
  });
});
