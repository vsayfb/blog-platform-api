import { Test, TestingModule } from '@nestjs/testing';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
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

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should create an account and return that', async () => {
    expect(await authController.register(accountStub())).toEqual(accountStub());

    expect(authService.register).toBeCalledWith(accountStub());
  });
});
