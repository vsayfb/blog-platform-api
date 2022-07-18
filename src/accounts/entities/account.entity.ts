import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

export enum RegisterType {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  display_name: string;

  @Column({ unique: true, select: false })
  email: string;

  @Column({ nullable: true, default: null })
  image: string | null;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.account)
  bookmarks: Bookmark[];

  @Column({
    type: 'enum',
    default: RegisterType.LOCAL,
    enum: RegisterType,
    select: false,
  })
  via: RegisterType;

  @Column({ type: 'enum', default: Role.USER, enum: Role })
  role: Role;

  @OneToMany(() => Follow, (follow) => follow.follower)
  followed: Follow;

  @OneToMany(() => Follow, (follow) => follow.followed)
  followers: Follow;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}
