export type TFAProcess =
  | 'enable_tfa_email'
  | 'login_tfa_email'
  | 'disable_tfa_email'
  | 'enable_tfa_mobile_phone'
  | 'login_tfa_mobile_phone'
  | 'disable_tfa_mobile_phone'
  | 'update_password'
  | 'add_email'
  | 'add_mobile_phone'
  | 'update_password';
