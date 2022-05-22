import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountsService {
  private readonly accounts = [
    {
      id: 1,
      username: 'john',
      email: 'john@gmail.com',
      password: 'changeme',
    },
    {
      id: 2,
      username: 'maria',
      email: 'maria@gmail.com',
      password: 'guess',
    },
  ];

  async findOne(username: string) {
    return this.accounts.find((user) => user.username === username);
  }
}
