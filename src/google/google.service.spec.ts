import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  accountStub,
  resultAccountStub,
} from 'src/accounts/tests/stub/account.stub';
import { GoogleService } from './google.service';

describe('GoogleService', () => {
  let googleService: GoogleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleService, ConfigService],
    }).compile();

    googleService = module.get<GoogleService>(GoogleService);
  });

  describe('getUserCredentials', () => {
    describe('when getUserCredentials called', () => {
      let axiosReturnValue = {
        email: accountStub().email,
        given_name: accountStub().username,
        family_name: accountStub().username,
      };

      let result: { email: string; given_name: string; family_name: string };

      beforeEach(async () => {
        jest.spyOn(axios, 'get').mockResolvedValueOnce({
          data: axiosReturnValue,
        });
        result = await googleService.getUserCredentials('foo');
      });

      it('should return the user credentials', () => {
        expect(result).toEqual(axiosReturnValue);
      });
    });
  });
});
