export type RegisterViewDto = {
  account: {
    id: string;
    username: string;
    image: string | null;
    displayName: string;
  };
  access_token: string;
};
