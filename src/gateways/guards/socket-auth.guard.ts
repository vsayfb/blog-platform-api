import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ProcessEnv } from 'src/lib/enums/env';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const token = req.handshake.auth.token?.split(' ')[1];

    try {
      this.jwtService.verify(token, {
        secret: this.configService.get(ProcessEnv.JWT_SECRET),
      });
    } catch (error) {
      return false;
    }

    return true;
  }
}
