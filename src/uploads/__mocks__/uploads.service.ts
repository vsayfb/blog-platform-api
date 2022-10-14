import { uploadImageStub } from '../stub/upload-image.stub';

export const UploadsService = jest.fn().mockReturnValue({
  uploadImage: jest.fn().mockResolvedValue(uploadImageStub().newImage),
  uploadProfileImage: jest.fn().mockResolvedValue(uploadImageStub().newImage),
});
