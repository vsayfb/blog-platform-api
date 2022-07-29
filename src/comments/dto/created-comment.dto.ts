import { PostDto } from 'src/posts/dto/post.dto';

export type CreatedCommentDto = {
  id: string;
  content: string;
  author: { id: string };
  post: PostDto;
  created_at: Date;
  updated_at: Date;
};
