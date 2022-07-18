import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';

export const CloudinaryService = jest.fn().mockReturnValue({
  uploadImage: jest.fn().mockResolvedValue(uploadProfileResultStub().newImage),

  uploadProfileImage: jest
    .fn()
    .mockResolvedValue(uploadProfileResultStub().newImage),
});
