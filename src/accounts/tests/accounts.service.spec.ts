import { Test, TestingModule } from '@nestjs/testing';
import { AccountsRepository } from '../accounts.repository';
import { AccountsService } from '../accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { accountStub } from './stub/account.stub';

jest.mock('../accounts.repository');

describe('AccountsService', () => {
  let accounstService: AccountsService;
  let accountsRepository: AccountsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService, AccountsRepository],
    }).compile();

    accounstService = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get<AccountsRepository>(AccountsRepository);
  });

  it('should be create a user and return that', async () => {
    let dto: CreateAccountDto = accountStub();

    expect(await accounstService.create(accountStub())).toEqual({
      id: expect.any(String),
      ...dto,
    });

    expect(accountsRepository.createAccount).toHaveBeenCalledWith(dto);
  });
});
