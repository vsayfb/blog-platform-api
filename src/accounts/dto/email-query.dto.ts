import { IsEmail, IsString } from 'class-validator';

export class EmailQueryDto {
  @IsEmail()
  email: string;
}
