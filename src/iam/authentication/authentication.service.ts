import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { HashingService } from '../hashing/hashing.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashingService: HashingService,
    private readonly usersService: UsersService,
  ) {}

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

       return this.usersService.create({
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
      });

      
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('Email déjà utilisé');
      }
      throw new BadRequestException('Error creating user', error.message);
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

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new BadRequestException('Email ou mot de passe incorrect.');
  }
}
