export type JwtPayload = {
  username: string;
  sub: string;
  iat: number;
  exp: number;
  image: string | null;
};
