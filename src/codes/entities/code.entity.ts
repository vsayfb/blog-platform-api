import { RegisterProcess } from 'src/auth/types/register-process';
import { TFAProcess } from 'src/security/types/tfa-process';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CodeProcess = RegisterProcess | TFAProcess;

export enum CodeProcessEnum {
  REGISTER_EMAIL = 'register_email',
  REGISTER_MOBIL_PHONE = 'register_mobile_phone',
  ENABLE_TFA_EMAIL = 'enable_tfa_email',
  LOGIN_TFA_EMAIL = 'login_tfa_email',
  DISABLE_TFA_EMAIL = 'disable_tfa_email',
  ENABLE_TFA_MOBILE_PHONE = 'enable_tfa_mobile_phone',
  LOGIN_TFA_MOBILE_PHONE = 'login_tfa_mobile_phone',
  DISABLE_TFA_MOBILE_PHONE = 'disable_tfa_mobile_phone',
}

@Entity()
export class Code {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  receiver: string;

  @Column({ type: 'enum', enum: CodeProcessEnum })
  process: CodeProcess;

  @CreateDateColumn()
  created_at: Date;
}
