import { JwtPayload } from '../jwt.payload';
import { VerificationTokenDto } from '../../resources/verification_codes/dto/verification-token.dto';
import { VerificationCodeDto } from '../../resources/verification_codes/dto/verification-code.dto';
import { VerificationCode } from '../../resources/verification_codes/entities/code.entity';

export interface Verification {
  process(
    client: JwtPayload,
    params: VerificationTokenDto,
    body: VerificationCodeDto,
    verification_code: VerificationCode,
  ): Promise<any>;
}
