import { IsIn, IsOptional } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';

export class PublishQueryDto {
  @IsIn(['true', 'false'])
  @IsOptional()
  @IsNotBlank()
  publish: string;
}
