import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/lib/jwt.payload';

export const Client = createParamDecorator(
  (data: keyof JwtPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    return data ? user[data] : user;
  },
);
