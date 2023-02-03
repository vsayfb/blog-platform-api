import { accountStub } from 'src/resources/accounts/test/stub/account.stub';

export const registerPayloadStub = () => ({
  account: accountStub(),
  access_token: '',
});
