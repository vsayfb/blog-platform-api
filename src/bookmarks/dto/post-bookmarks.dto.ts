import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedBookmarkFields } from '../types/selected-bookmark-fields';

export type PostBookmarks = SelectedBookmarkFields &
  {
    account: SelectedAccountFields;
  }[];
