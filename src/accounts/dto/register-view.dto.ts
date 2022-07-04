export type RegisterViewDto = {
  data: {
    id: string;
    username: string;
    image: string | null;
    display_name: string;
  };
  access_token: string;
};
