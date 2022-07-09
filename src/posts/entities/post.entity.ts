import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: null })
  title_image: string | null;

  @ManyToOne((_type) => Account, (account) => account.posts, {
    eager: true,
    onDelete: 'CASCADE',
  })
  author: Account;

  @OneToMany((_type) => Comment, (comment) => comment.post, {
    eager: true,
    onDelete: 'CASCADE',
  })
  comments: Comment;

  @ManyToMany(() => Tag, (tag) => tag.posts, { eager: true })
  @JoinTable()
  tags: Tag[];

  @Column({ unique: true })
  url: string;

  @Column()
  content: string;

  @Column({ default: true })
  published?: boolean | undefined;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
