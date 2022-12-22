import { SelectedTFAFields } from 'src/security/types/selected-tfa';
import { AccountWithCredentials } from './account-with-credentials';

export type TFAAccount = AccountWithCredentials & {
  two_factor_auth: SelectedTFAFields;
};
