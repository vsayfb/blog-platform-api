import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedBookmarkFields } from '../types/selected-bookmark-fields';

export type PostBookmark = SelectedBookmarkFields & {
  account: SelectedAccountFields;
};
