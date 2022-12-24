import { IsMobilePhone, IsString } from 'class-validator';

export class AddMobilePhoneDto {
  @IsString()
  @IsMobilePhone()
  phone: string;

  @IsString()
  password: string;
}
