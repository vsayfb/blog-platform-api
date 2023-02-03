export type ProfileType = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: string;
  followers_count: number;
  following_count: number;
  following_by: boolean;
  created_at: Date;
};
