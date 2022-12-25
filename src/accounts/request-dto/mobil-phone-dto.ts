import { IsMobilePhone, IsString } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class MobilePhoneDto {
  @IsMobilePhone()
  @IsString()
  @IsNotBlank()
  mobile_phone: string;
}
