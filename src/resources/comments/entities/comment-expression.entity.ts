import { Account } from 'src/resources/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostComment } from './post-comment.entity';

export enum CommentExpressionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity({ name: 'comment_expressions' })
export class CommentExpression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PostComment, { onDelete: 'CASCADE' })
  comment: PostComment;

  @Column({ type: 'enum', enum: CommentExpressionType })
  expression: CommentExpressionType;

  @ManyToOne(() => Account)
  account: Account;

  @CreateDateColumn()
  created_at: Date;
}
