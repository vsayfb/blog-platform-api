import { IsEmail } from 'class-validator';

export class EmailQueryDto {
  @IsEmail()
  email: string;
}
