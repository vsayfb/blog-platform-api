import { Controller } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller({
  path: 'accounts',
})
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}
}
