import { SelectedSocialFields } from 'src/social/types/selected-social-fields';

export type AccountProfileDto = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: string;
  followers_count: number;
  following_count: number;
  social_media_links: SelectedSocialFields | null;
  created_at: Date;
};
