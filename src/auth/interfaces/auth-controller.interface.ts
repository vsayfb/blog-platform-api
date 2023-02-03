import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { LoginDto } from '../response-dto/login.dto';
import { RegisterDto } from '../response-dto/register.dto';

export interface IAuthController {
  register(...data: any): Promise<{ data: RegisterDto; message: string }>;

  login(
    account: SelectedAccountFields,
  ): Promise<{ data: LoginDto; message: string }>;
}
