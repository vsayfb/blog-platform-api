describe('TagNamePipe', () => {
  it('should be return an array of containing clear values', () => {
    const tags = ['what is nodejs?', 'How-To-Code', 'nodejs'];

    const transformedTags: string[] = [];

    tags.map((tag) => {
      transformedTags.push(
        tag
          .toLowerCase()
          .trim()
          .replace(/ /g, '-')
          .replace(/[^a-zA-Z-]/g, ''),
      );
    });

    const expectedResult = ['what-is-nodejs', 'how-to-code', 'nodejs'];

    expect(transformedTags).toEqual(expectedResult);
  });
});
