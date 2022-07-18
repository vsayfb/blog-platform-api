import { Test } from '@nestjs/testing';
import axios from 'axios';
import { GoogleService } from 'src/apis/google/google.service';
import { googleUserCredentialsStub } from '../stub/google-credentials.stub';

describe('GoogleService', () => {
  let googleService: GoogleService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GoogleService],
    }).compile();

    googleService = moduleRef.get<GoogleService>(GoogleService);
  });

  describe('getUserCredentials', () => {
    let result: { email: string; given_name: string; family_name: string };
    const access_token = 'access_token';

    describe('when getUserCredentials is called', () => {
      beforeEach(async () => {
        jest
          .spyOn(axios, 'get')
          .mockResolvedValue({ data: googleUserCredentialsStub() });

        result = await googleService.getUserCredentials(access_token);
      });

      test('calls axios.get', () => {
        expect(axios.get).toHaveBeenCalled();
      });

      it('should return the google user credentials', () => {
        expect(result).toEqual({
          email: googleUserCredentialsStub().email,
          given_name: googleUserCredentialsStub().given_name,
          family_name: googleUserCredentialsStub().family_name,
        });
      });
    });
  });
});
