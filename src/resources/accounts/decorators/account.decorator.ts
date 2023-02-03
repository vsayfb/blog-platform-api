import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountWithCredentials } from '../types/account-with-credentials';

export const AccountCredentials = createParamDecorator(
  (data: keyof AccountWithCredentials, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const account = request.account_credentials;

    return data ? account[data] : account;
  },
);
