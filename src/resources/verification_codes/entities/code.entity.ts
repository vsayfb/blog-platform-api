import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CodeProcess {
  REGISTER_WITH_EMAIL = 'REGISTER_WITH_EMAIL',
  REGISTER_WITH_MOBIL_PHONE = 'REGISTER_WITH_MOBIL_PHONE',
  ADD_EMAIL_TO_ACCOUNT = 'ADD_EMAIL_TO_ACCOUNT',
  ADD_MOBILE_PHONE_TO_ACCOUNT = 'ADD_MOBILE_PHONE_TO_ACCOUNT',
  REMOVE_EMAIL_FROM_ACCOUNT = 'REMOVE_EMAIL_FROM_ACCOUNT',
  REMOVE_MOBILE_PHONE_FROM_ACCOUNT = 'REMOVE_MOBILE_PHONE_FROM_ACCOUNT',
  ENABLE_TFA_EMAIL_FACTOR = 'ENABLE_TFA_EMAIL_FACTOR',
  ENABLE_TFA_MOBILE_PHONE_FACTOR = 'ENABLE_TFA_MOBILE_PHONE_FACTOR',
  DISABLE_TFA_EMAIL_FACTOR = 'DISABLE_TFA_EMAIL_FACTOR',
  DISABLE_TFA_MOBILE_PHONE_FACTOR = 'DISABLE_TFA_MOBILE_PHONE_FACTOR',
  LOGIN_TFA_EMAIL = 'LOGIN_TFA_EMAIL',
  LOGIN_TFA_MOBILE_PHONE = 'LOGIN_TFA_MOBILE_PHONE',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

@Entity()
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  receiver: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'enum', enum: CodeProcess, nullable: false })
  process: CodeProcess;

  @CreateDateColumn()
  created_at: Date;
}
