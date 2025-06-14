import { AccessTokenGuard } from './access-token.guard';
import { JwtService } from '@nestjs/jwt';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    const guard = new AccessTokenGuard(new JwtService({}), {} as any);
    expect(guard).toBeDefined();
  });
});
