import { Account } from 'src/accounts/entities/account.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, (post) => post.bookmarks, {
    eager: true,
    onDelete: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => Account, (account) => account.bookmarks, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @CreateDateColumn()
  createdAt: Date;
}
