import { Account } from 'src/accounts/entities/account.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.comments)
  author: Account;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  to: Comment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
