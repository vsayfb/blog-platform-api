import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from '../accounts.controller';
import { AccountsService } from '../accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { accountStub } from './stub/account.stub';

jest.mock('../accounts.service');

describe('AccountsController', () => {
  let accountsController: AccountsController;
  let accountsService: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile();

    accountsController = module.get<AccountsController>(AccountsController);
    accountsService = module.get<AccountsService>(AccountsService);
  });

  it('should create an account and return that', async () => {
    let dto: CreateAccountDto = accountStub();

    expect(await accountsController.create(dto)).toEqual(dto);

    expect(accountsService.create).toHaveBeenCalledWith(dto);
  });
});

