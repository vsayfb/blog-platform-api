import { IsIn, IsOptional } from 'class-validator';

export class PublishQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  publish: string;
}
