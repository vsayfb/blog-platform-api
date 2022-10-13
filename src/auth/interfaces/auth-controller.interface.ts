import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { LoginViewDto } from '../dto/login-view.dto';
import { RegisterViewDto } from '../dto/register-view.dto';

export interface IAuthController {
  register(...data: any): Promise<{ data: RegisterViewDto; message: string }>;

  login(
    account: SelectedAccountFields,
  ): Promise<{ data: LoginViewDto; message: string }>;
}
