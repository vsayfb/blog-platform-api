import { Comment } from 'src/comments/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';

export type AccountProfileDto = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: string;
  posts: Post[];
  comments: Comment[];
  followers: number;
  followed: number;
  created_at: Date;
};
