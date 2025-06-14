import { AuthenticationGuard } from './authentication.guard';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthenticationGuard', () => {
  it('should be defined', () => {
    const guard = new AuthenticationGuard(
      new Reflector(),
      new AccessTokenGuard(new JwtService({}), {} as any),
    );
    expect(guard).toBeDefined();
  });
});
