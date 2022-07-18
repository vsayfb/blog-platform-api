import { uploadProfileResultStub } from '../stub/upload-profile.stub';

export const UploadsService = jest.fn().mockReturnValue({
  uploadImage: jest.fn().mockResolvedValue(uploadProfileResultStub().newImage),
  uploadProfileImage: jest
    .fn()
    .mockResolvedValue(uploadProfileResultStub().newImage),
});
