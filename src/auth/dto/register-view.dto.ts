import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type RegisterViewDto = {
  account: SelectedAccountFields;
  access_token: string;
};
