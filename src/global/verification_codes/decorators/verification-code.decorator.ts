import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { VerificationCode } from '../entities/code.entity';

export const VerificationCodeObj = createParamDecorator(
  (data: keyof VerificationCode, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const code = request.verification_code;

    return data ? code[data] : code;
  },
);
