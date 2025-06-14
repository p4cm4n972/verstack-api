import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
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

  describe('signUp', () => {
    const dto = { email: 'new@test.com', password: 'pwd' } as any;

    it('creates user and sends confirmation email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      hashingService.hash.mockResolvedValue('hashed');
      usersService.create = jest.fn().mockResolvedValue({ _id: '1', email: dto.email });
      jest.spyOn(service, 'generateEmailVerificationToken').mockResolvedValue('token');

      await service.signUp(dto);

      expect(hashingService.hash).toHaveBeenCalledWith('pwd');
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ email: dto.email, password: 'hashed' }));
      expect(mailService.sendConfirmationEmail).toHaveBeenCalledWith(dto.email, 'token');
    });

    it('throws when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue({});
      await expect(service.signUp(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when password is missing', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.signUp({ email: 'a' } as any)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('signIn', () => {
    const dto = { email: 't', password: 'p' } as any;

    it('returns tokens when credentials are valid and email verified', async () => {
      const user = { id: 1, _id: '1', password: 'hash', isEmailVerified: true } as any;
      userModel.findOne.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({ accessToken: 'a', refreshToken: 'r' } as any);

      const result = await service.signIn(dto);

      expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
      expect(service.generateTokens).toHaveBeenCalledWith(user);
    });

    it('throws when user does not exist', async () => {
      userModel.findOne.mockResolvedValue(null);
      await expect(service.signIn(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when password mismatch', async () => {
      const user = { password: 'hash', isEmailVerified: true } as any;
      userModel.findOne.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(false);
      await expect(service.signIn(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when email not verified', async () => {
      const user = { password: 'hash', isEmailVerified: false } as any;
      userModel.findOne.mockResolvedValue(user);
      hashingService.compare.mockResolvedValue(true);
      await expect(service.signIn(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('generateTokens', () => {
    it('signs tokens and stores refresh token id', async () => {
      const signSpy = jest.spyOn<any, any>(service as any, 'signToken');
      signSpy.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');
      const user = { id: 1, _id: '1', pseudo: 'p', role: 'r', permissions: [] } as any;

      const result = await service.generateTokens(user);

      expect(signSpy).toHaveBeenNthCalledWith(1, 1, config.accessTokenTtl, {
        pseudo: 'p',
        id: '1',
        role: 'r',
        permissions: [],
      });
      expect(signSpy).toHaveBeenNthCalledWith(2, 1, config.refreshTokenTtl, {
        refreshTokenId: expect.any(String),
      });
      expect(refreshTokenIdsStorage.insert).toHaveBeenCalledWith(1, expect.any(String));
      expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    });
  });
});
