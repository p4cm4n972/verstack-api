import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto/refresh-token.dto';

@Auth(AuthType.None)
@Controller('api/authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  //TODO : add a cookie to the response with the access token
  //   @HttpCode(HttpStatus.OK)
  //   @Post('signin')
  //   async signIn(
  //     @Res({ passthrough: true }) response: Response, import { Response } from 'express';
  //     @Body() signInDto: SignInDto,
  //   ) {
  //     const accessToken = await this.authService.signIn(signInDto);
  //     response.cookie('accessToken', accessToken, {
  //       secure: true,
  //       httpOnly: true,
  //       sameSite: true,
  //     });
  //   }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
