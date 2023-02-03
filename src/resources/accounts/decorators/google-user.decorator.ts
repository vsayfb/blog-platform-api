import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GoogleUserCredentials } from 'src/apis/google/google.service';

export const VerifiedGoogleUser = createParamDecorator(
  (data: keyof GoogleUserCredentials, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.verified_google_user;

    return data ? user[data] : user;
  },
);
