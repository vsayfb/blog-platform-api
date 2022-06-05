import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';

@Injectable()
export class GoogleService {
  private oauth2: Auth.OAuth2Client;

  constructor(private configService: ConfigService) {
    this.oauth2 = new google.auth.OAuth2({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    });
  }

  private async verify(idToken: string) {
    let audience = this.configService.get<string>('GOOGLE_CLIENT_ID');

    return this.oauth2.verifyIdToken({
      idToken,
      audience,
    });
  }

  async authorization(access_token: string) {
    const { getPayload } = await this.verify(access_token);

    return getPayload();
  }
}
