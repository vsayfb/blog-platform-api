export type JwtPayload = {
  username: string;
  sub: string;
  image: string | null;
  iat: number;
  exp: number;
};
