import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  GoogleService,
  GoogleUserCredentials,
} from 'src/apis/google/google.service';

/**
 * Validate google_access_token in body before using this guard.
 *
 * If user verified this guard puts user credentials then
 * you can get credentials using @VerifiedGoogleUser decorator.
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

    if (!user) return false;

    req.verified_google_user = user;

    return true;
  }
}
