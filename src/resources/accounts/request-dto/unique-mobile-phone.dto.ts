import { IsMobilePhone, IsString } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';
import { UniquePhone } from '../validators/check-unique.phone';

export class UniqueMobilePhoneDto {
  @UniquePhone()
  @IsMobilePhone()
  @IsString()
  @IsNotBlank()
  mobile_phone: string;
}
