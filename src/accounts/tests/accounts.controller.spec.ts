import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from '../accounts.controller';
import { AccountsService } from '../accounts.service';

jest.mock('../accounts.service');

describe('AccountsController', () => {
  let accountsController: AccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile();

    accountsController = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(accountsController).toBeDefined();
  });
});
