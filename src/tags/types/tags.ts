import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { SelectedTagFields } from './selected-tag-fields';

export type Tags = SelectedTagFields & { author: SelectedAccountFields }[];
