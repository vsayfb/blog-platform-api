import { accountStub } from 'src/accounts/test/stub/account.stub';

export const registerPayloadStub = () => ({
  account: accountStub(),
  access_token: '',
});
