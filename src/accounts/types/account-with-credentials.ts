import { SelectedTFAFields } from 'src/tfa/types/selected-tfa';
import { RegisterType } from '../entities/account.entity';
import { SelectedAccountFields } from './selected-account-fields';

export type AccountWithCredentials = SelectedAccountFields & {
  email: string | null;
  password: string;
  mobile_phone: string | null;
  via: RegisterType;
  two_factor_auth: SelectedTFAFields;
};
