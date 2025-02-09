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

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto) {

    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const saltOrRounds = 10;
    if (!signUpDto.password) {
      throw new BadRequestException('Password is required');
    }
    const hashedPassword = await bcrypt.hash(signUpDto.password, saltOrRounds);

    return this.usersService.create({
      pseudo: signUpDto.pseudo || '',
      email: signUpDto.email || '',
      job: signUpDto.job || '',
      ageRange: signUpDto.ageRange || '',
      SalaryRange: signUpDto.SalaryRange || '',
      experience: signUpDto.experience || '',
      acceptTerms: signUpDto.acceptTerms || false,
      isAdmin: signUpDto.isAdmin || false,
      password: hashedPassword,
    });
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userModel.findOne({
      email: signInDto.email,
      password: signInDto.password,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new BadRequestException('Email ou mot de passe incorrect.');
  }
}
