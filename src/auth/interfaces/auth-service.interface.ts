import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';

export interface IAuthService {
  register(
    data: any,
  ): Promise<{ account: SelectedAccountFields; access_token: string }>;

  login(data: SelectedAccountFields): {
    account: SelectedAccountFields;
    access_token: string;
  };
}
