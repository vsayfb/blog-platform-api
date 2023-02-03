import { Account } from 'src/resources/accounts/entities/account.entity';
import { Post } from 'src/resources/posts/entities/post.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.bookmarks, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => Account, (account) => account.bookmarks, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @CreateDateColumn()
  created_at: Date;
}
