import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

export enum PostExpressionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity()
export class PostExpression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Column({ type: 'enum', enum: PostExpressionType })
  expression: PostExpressionType;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  account: Account;

  @CreateDateColumn()
  created_at: Date;
}
