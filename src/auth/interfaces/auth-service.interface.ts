import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';

export interface IAuthService {
  register(
    data: any,
  ): Promise<{ account: SelectedAccountFields; access_token: string }>;

  login(data: any): {
    account: SelectedAccountFields;
    access_token: string;
  };
}
