import { IsUUID } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';
import { PostExists } from 'src/resources/posts/validators/check-post-exists';

export class PostIDParam {
  @PostExists()
  @IsUUID()
  @IsNotBlank()
  post_id: string;
}
