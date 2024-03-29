import { Bookmark } from 'src/resources/bookmarks/entities/bookmark.entity';
import { Chat } from 'src/resources/chats/entities/chat.entity';
import { PostComment } from 'src/resources/comments/entities/post-comment.entity';
import { Follow } from 'src/resources/follow/entities/follow.entity';
import { Post } from 'src/resources/posts/entities/post.entity';
import { TwoFactorAuth } from 'src/resources/tfa/entities/two-factor-auth.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToOne,
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

  @Column()
  image: string;

  @Column({ unique: true, select: false, nullable: true })
  email: string | null;

  @Column({ unique: true, select: false, nullable: true })
  mobile_phone: string | null;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => PostComment, (comment) => comment.author)
  comments: PostComment[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.account)
  bookmarks: Bookmark[];

  @Column({
    type: 'enum',
    default: RegisterType.LOCAL,
    enum: RegisterType,
    select: false,
  })
  via: RegisterType;

  @OneToOne(() => TwoFactorAuth, (t2a) => t2a.account)
  two_factor_auth: TwoFactorAuth;

  @Column({ type: 'enum', default: Role.USER, enum: Role })
  role: Role;

  @ManyToMany(() => Chat, (chat) => chat.members)
  chats: Chat[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followed: Follow;

  @OneToMany(() => Follow, (follow) => follow.followed)
  followers: Follow;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;
}
