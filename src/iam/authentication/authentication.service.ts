import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import { HashingService } from '../hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto/refresh-token.dto';
import {
  InvalidateRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { MailService } from '../../mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly usersService: UsersService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly mailService: MailService
  ) { }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    if (!signUpDto.password) {
      throw new BadRequestException('Password is required');
    }

    try {
      const hashedPassword = await this.hashingService.hash(signUpDto.password);

      const createdUser = await this.usersService.create({
        sexe: signUpDto.sexe || '',
        firstName: signUpDto.firstName || '',
        lastName: signUpDto.lastName || '',
        pseudo: signUpDto.pseudo || '',
        email: signUpDto.email || '',
        job: signUpDto.job || '',
        ageRange: signUpDto.ageRange || '',
        salaryRange: signUpDto.salaryRange || '',
        experience: signUpDto.experience || '',
        acceptTerms: signUpDto.acceptTerms || false,
        isAdmin: signUpDto.isAdmin || false,
        password: hashedPassword,
        profilePicture: signUpDto.profilePicture || '',
        favoris: signUpDto.favoris || [],
        friends: signUpDto.friends || [],
        projets: signUpDto.projets || [],
        isEmailVerified: signUpDto.isEmailVerified || false,
      });

      const emailToken = await this.generateEmailVerificationToken(createdUser._id);


      await this.mailService.sendConfirmationEmail(createdUser.email, emailToken)


    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('Email déjà utilisé');
      }
      throw new BadRequestException('Error creating user', error.message);
    }
  }
  async generateEmailVerificationToken(userId: string | any): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: '1d', // validité du lien 24h par exemple
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );
  }

  async verifyEmail(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("Utilisateur non trouvé.");
      }

      if (user.isEmailVerified) {
        return { message: 'Adresse e-mail déjà vérifiée.' };
      }

      user.isEmailVerified = true;
      await user.save();

      return { message: 'Adresse e-mail vérifiée avec succès.' };
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Lien de vérification invalide ou expiré.');
    }
  }


  async signIn(signInDto: SignInDto) {
    const user = await this.userModel.findOne({
      email: signInDto.email,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Password is incorrect');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        "Votre adresse e-mail n'est pas vérifiée. Veuillez consulter votre boîte mail."
      );
    }


    return await this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          pseudo: user.pseudo,
          id: user._id,
          role: user.role,
          permissions: user.permissions,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
      });
      const user = await this.userModel.findOne({ _id: sub });
      const isValid = await this.refreshTokenIdsStorage.validate(
        user?.id,
        refreshTokenId,
      );
      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(user?.id);
      } else {
        throw new UnauthorizedException('Refresh token is invalid');
      }
      if (user) {
        return this.generateTokens(user);
      }
    } catch (error) {
      if (error instanceof InvalidateRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new BadRequestException('Email ou mot de passe incorrect.');
  }

  // src/auth/authentication.service.ts

  async sendPasswordResetLink(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException("Cet utilisateur n'existe pas.");
    }

    const payload = {
      sub: user._id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: '15m',
    });



    await this.mailService.sendReinitialisationMail(user, token);

    return { message: 'Un lien de réinitialisation a été envoyé par e-mail.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<any> {
    try {
      const { sub: userId } = await this.jwtService.verifyAsync<{ sub: string }>(
        dto.token,
        {
          secret: this.jwtConfiguration.secret,
        }
      );

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      const hashedPassword = await this.hashingService.hash(dto.newPassword);
      user.password = hashedPassword;
      await user.save();

      return { message: 'Mot de passe réinitialisé avec succès.' };
    } catch (error) {
      throw new UnauthorizedException('Jeton invalide ou expiré.');
    }
  }



}
