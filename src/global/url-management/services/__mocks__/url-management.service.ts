export const UrlManagementService = jest.fn().mockImplementation(() => {
  return {
    convertToUniqueUrl: jest.fn().mockImplementation((text: string) => {
      return text;
    }),
  };
});
