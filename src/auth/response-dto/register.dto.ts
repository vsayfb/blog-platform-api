import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';

export type RegisterDto = {
  account: SelectedAccountFields;
  access_token: string;
};
