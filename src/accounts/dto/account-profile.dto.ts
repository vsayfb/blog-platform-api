export type AccountProfileDto = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: string;
  followers_count: number;
  following_count: number;
  created_at: Date;
};
