import { SelectedAccountFields } from './selected-account-fields';

export type AccountWithCredentials = SelectedAccountFields & {
  email: string;
  password: string;
};
