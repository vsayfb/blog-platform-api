import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type Subscriptions = {
  mails_turned_on: boolean;
  notifications_turned_on: boolean;
};

const subscriptionsDefault: Subscriptions = {
  mails_turned_on: false,
  notifications_turned_on: false,
};

@Entity()
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE' })
  follower: Account;

  @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE' })
  followed: Account;

  @Column({ type: 'jsonb', default: subscriptionsDefault })
  subscriptions: Subscriptions;

  @CreateDateColumn()
  created_at: Date;
}
