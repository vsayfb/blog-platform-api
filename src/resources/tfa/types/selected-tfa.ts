import { TFAVia } from '../entities/two-factor-auth.entity';

export type SelectedTFAFields = {
  id: string;
  via: TFAVia;
  created_at: Date;
  updated_at: Date;
};
