import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type RegisterDto = {
  account: SelectedAccountFields;
  access_token: string;
};
