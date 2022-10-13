import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthService } from '../services/google-auth.service';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  private extractGoogleToken(req: Request) {
    const token = req.headers.authorization;

    if (!token) throw new UnauthorizedException();

    return token;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const googleToken = this.extractGoogleToken(req);

    const account = await this.googleAuthService.validateAccount(googleToken);

    if (!account) throw new UnauthorizedException();

    req.user = account;

    return true;
  }
}
