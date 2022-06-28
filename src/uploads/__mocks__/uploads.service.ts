export const UploadsService = jest.fn().mockReturnValue({
  uploadImage: jest.fn().mockResolvedValue({}),
  uploadProfileImage: jest.fn().mockResolvedValue('https://new_image.com'),
});
