import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: null })
  titleImage: string | null;

  @ManyToOne((_type) => Account, (account) => account.posts, {
    onDelete: 'CASCADE',
    eager: true,
  })
  author: Account;

  @Column({ unique: true })
  url: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
