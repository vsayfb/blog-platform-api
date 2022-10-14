import { uploadImageStub } from 'src/uploads/stub/upload-image.stub';

export const CloudinaryService = jest.fn().mockReturnValue({
  uploadImage: jest.fn().mockResolvedValue(uploadImageStub().newImage),

  uploadProfileImage: jest.fn().mockResolvedValue(uploadImageStub().newImage),
});
