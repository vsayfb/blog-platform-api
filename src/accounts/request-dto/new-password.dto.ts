import { Length } from "class-validator";
import { IsNotBlank } from "src/lib/validators/is-not-blank";

export class NewPasswordDto {
  @Length(7, 16)
  @IsNotBlank()
  new_password: string;
}
