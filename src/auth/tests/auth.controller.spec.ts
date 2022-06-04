import { Test, TestingModule } from '@nestjs/testing';
import {
  accountStub,
  resultAccountStub,
} from 'src/accounts/tests/stub/account.stub';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

jest.mock('../auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create an account and return that', async () => {
      let dto = accountStub();

      expect(await authController.register(dto)).toEqual({
        id: expect.any(String),
        ...dto,
      });

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });
});
