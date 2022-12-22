import { SelectedAccountFields } from './selected-account-fields';

export type AccountWithCredentials = SelectedAccountFields & {
  email: string | null;
  password: string;
  mobile_phone: string | null;
};
