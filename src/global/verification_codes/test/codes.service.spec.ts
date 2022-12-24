import { getRepositoryToken } from '@nestjs/typeorm';
import { codeStub } from 'src/verification_codes/stub/code.stub';
import { Test } from '@nestjs/testing';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { CodesService } from 'src/verification_codes/verification-codes.service';
import { Code } from '../entities/code.entity';
import { Repository } from 'typeorm';
import { mockRepository } from '../../../test/helpers/utils/mockRepository';

describe('CodeService', () => {
  let codesService: CodesService;
  let codesRepository: Repository<Code>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CodesService,
        { provide: getRepositoryToken(Code), useClass: Repository },
      ],
    }).compile();

    codesService = moduleRef.get<CodesService>(CodesService);
    codesRepository = moduleRef.get<Repository<Code>>(getRepositoryToken(Code));

    mockRepository(codesRepository, Code);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { code: string; codeID: string };
      const receiver = accountStub().username;

      const code = codeStub().code;

      beforeEach(async () => {
        jest
          .spyOn(CodesService.prototype, 'generateCode' as any)
          .mockReturnValue(code);

        result = await codesService.create(receiver);
      });

      test('calls codesService.generateCode method', () => {
        //@ts-ignore private method
        expect(codesService.generateCode).toHaveBeenCalled();
      });

      test('calls repository.save method with generated code and receiver', () => {
        expect(codesRepository.save).toHaveBeenCalledWith({ code, receiver });
      });

      it('should return generated code', () => {
        expect(result.code).toBe(code);
      });
    });
  });

  describe('getCode', () => {
    describe('when getCode is called', () => {
      let result: Code;
      const codeID = codeStub().id;

      beforeEach(async () => {
        result = await codesService.getCode(codeID);
      });

      test('calls repository.findOne method ', () => {
        expect(codesRepository.findOne).toHaveBeenCalledWith({
          where: { code: codeID },
        });
      });

      it('should return a code', () => {
        expect(result).toEqual({ ...codeStub(), id: expect.any(String) });
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;
      const codeID = codeStub().id;

      beforeEach(async () => {
        result = await codesService.delete(codeStub().id);
      });

      test('calls repository.findOne method ', () => {
        expect(codesRepository.findOne).toHaveBeenCalledWith({
          where: { id: codeStub().id },
        });
      });

      test('calls repository.remove method ', () => {
        expect(codesRepository.remove).toHaveBeenCalledWith(codeStub());
      });

      it('should return removed code id ', () => {
        expect(result).toBe(codeID);
      });
    });
  });
});
