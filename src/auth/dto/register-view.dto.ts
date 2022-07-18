import { SelectedAccountFields } from '../../accounts/types/selected-account-fields';

export type RegisterViewDto = {
  data: SelectedAccountFields;
  access_token: string;
};
