import { Account } from 'src/accounts/entities/account.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ExpressionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity()
export class Expression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Account, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  left: Account;

  @Column({ type: 'enum', enum: ExpressionType })
  type: ExpressionType;

  @CreateDateColumn()
  created_at: Date;
}
