import { SelectedAccountFields } from './selected-account-fields';

export type AccountWithCredentials = SelectedAccountFields & {
  email: string;
  password: string;
  mobile_phone: string | null;
};
