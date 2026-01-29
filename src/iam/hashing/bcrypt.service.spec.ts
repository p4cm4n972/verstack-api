import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('hash() returns a string different from the input', async () => {
    const password = 'test';
    const hashed = await service.hash(password);
    expect(typeof hashed).toBe('string');
    expect(hashed).not.toEqual(password);
  });

  it('compare() successfully matches a hashed value', async () => {
    const password = 'secret';
    const hashed = await service.hash(password);
    await expect(service.compare(password, hashed)).resolves.toBe(true);
  });
});
