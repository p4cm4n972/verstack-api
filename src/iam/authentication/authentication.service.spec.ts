import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../../users/users.service';
import { HashingService } from '../hashing/hashing.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { MailService } from '../../mail.service';
import jwtConfig from '../config/jwt.config';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));
import * as bcrypt from 'bcrypt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  const userModel = { findOne: jest.fn(), findById: jest.fn() } as any;
  const usersService = { findByEmail: jest.fn() } as any;
  const hashingService = { compare: jest.fn(), hash: jest.fn() } as any;
  const jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() } as any;
  const refreshTokenIdsStorage = { insert: jest.fn(), validate: jest.fn(), invalidate: jest.fn() } as any;
  const mailService = { sendConfirmationEmail: jest.fn(), sendReinitialisationMail: jest.fn() } as any;
  const config = { secret: 's', audience: 'a', issuer: 'i', accessTokenTtl: 3600, refreshTokenTtl: 7200 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: HashingService, useValue: hashingService },
        { provide: JwtService, useValue: jwtService },
        { provide: jwtConfig.KEY, useValue: config },
        { provide: UsersService, useValue: usersService },
        { provide: RefreshTokenIdsStorage, useValue: refreshTokenIdsStorage },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      const user = { email: 'test@example.com', password: 'hash' } as any;
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'pwd');

      expect(result).toBe(user);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'hash');
    });

    it('throws when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.validateUser('x', 'y')).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
