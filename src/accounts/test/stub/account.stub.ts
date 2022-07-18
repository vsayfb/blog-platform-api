import { Role } from 'src/accounts/entities/account.entity';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';

export const accountStub = (): SelectedAccountFields => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  display_name: 'foo_display_name',
  username: 'foo',
  image: null,
  role: Role.USER,
  created_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
});
