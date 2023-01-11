import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedPostFields } from '../types/selected-post-fields';

export type PublicPost = SelectedPostFields & {
  author: SelectedAccountFields;
};
