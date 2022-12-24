import { SelectedTFAFields } from 'src/security/types/selected-tfa';
import { SelectedAccountFields } from './selected-account-fields';

export type AccountWithCredentials = SelectedAccountFields & {
  email: string | null;
  password: string;
  mobile_phone: string | null;
  two_factor_auth: SelectedTFAFields;
};
