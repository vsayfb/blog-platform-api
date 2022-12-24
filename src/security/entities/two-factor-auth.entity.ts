import { Account } from 'src/accounts/entities/account.entity';
import { NotificationBy } from 'src/notifications/types/notification-by';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TFAVia = NotificationBy;

@Entity()
export class TwoFactorAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['mobile_phone', 'email'] })
  via: TFAVia;

  @JoinColumn()
  @OneToOne(() => Account, (acc) => acc.two_factor_auth, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
