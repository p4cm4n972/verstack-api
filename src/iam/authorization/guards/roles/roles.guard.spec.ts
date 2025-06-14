import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  it('should be defined', () => {
    const guard = new RolesGuard(new Reflector());
    expect(guard).toBeDefined();
  });
});
