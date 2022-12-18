import { Subscriptions } from "src/follow/entities/follow.entity";

export type ProfileDto = {
  id: string;
  username: string;
  display_name: string;
  image: string | null;
  role: string;
  followers_count: number;
  following_count: number;
  following_by: boolean;
  subscriptions_by: Subscriptions;
  created_at: Date;
};
