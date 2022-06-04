import { AuthClient, OAuth2Client } from 'google-auth-library';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.client = new OAuth2Client({
      clientId: configService.get<string>('GOOGLE_CLIENT_ID'),
    });
  }

  async auth(idToken: string) {
    let audience = this.configService.get<string>('GOOGLE_CLIENT_ID');

    await this.client.verifyIdToken({ idToken, audience });
  }
}
