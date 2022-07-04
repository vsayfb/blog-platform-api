import { Injectable } from '@nestjs/common';
import axios from 'axios';

export type GoogleUserCredentials = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
  hd: string;
};

@Injectable()
export class GoogleService {
  private userInfoURL = 'https://www.googleapis.com/oauth2/v3/userinfo';

  async getUserCredentials(
    access_token: string,
  ): Promise<{ email: string; given_name: string; family_name: string }> {
    const { data }: { data: GoogleUserCredentials } = await axios.get(
      this.userInfoURL,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        method: 'GET',
      },
    );

    return {
      email: data.email,
      given_name: data.given_name,
      family_name: data.family_name,
    };
  }
}
