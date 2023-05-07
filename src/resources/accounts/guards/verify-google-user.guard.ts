import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  GoogleService,
  GoogleUserCredentials,
} from 'src/apis/google/google.service';
import { AccountMessages } from '../enums/account-messages';

/**
 * Validate google_access_token in body before using this guard.
 *
 * If user verified this guard it puts user into request object.
 *
 * Then you can get credentials using @VerifiedGoogleUser decorator.
 */

@Injectable()
export class VerifyGoogleUser implements CanActivate {
  constructor(private readonly googleService: GoogleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      body: { google_access_token: string };
      verified_google_user: GoogleUserCredentials;
    } = context.switchToHttp().getRequest();

    const user = await this.googleService.getUserCredentials(
      req.body.google_access_token,
    );

    if (!user) throw new ForbiddenException(AccountMessages.NOT_FOUND);

    req.verified_google_user = user;

    return true;
  }
}
