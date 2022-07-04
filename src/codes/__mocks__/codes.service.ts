import { codeStub } from '../stub/code.stub';

export const CodesService = jest.fn().mockReturnValue({
  getCode: jest.fn().mockResolvedValue(codeStub),
  createCode: jest.fn().mockResolvedValue(codeStub),
  removeCode: jest.fn().mockResolvedValue({}),
});
