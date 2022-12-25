import { codeStub } from '../stub/code.stub';

export const CodesService = jest.fn().mockReturnValue({
  getCode: jest.fn().mockResolvedValue(codeStub()),
  create: jest.fn().mockResolvedValue(codeStub()),
  delete: jest.fn().mockResolvedValue(codeStub().id),
});
