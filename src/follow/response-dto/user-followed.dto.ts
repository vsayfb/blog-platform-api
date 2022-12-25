import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedFollowFields } from '../types/selected-follow-fields';

export type UserFollowedDto = SelectedFollowFields &
  {
    followed: SelectedAccountFields;
  }[];
