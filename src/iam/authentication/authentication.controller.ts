import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';

@Auth(AuthType.None)
@Controller('api/authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) { }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token)
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.sendPasswordResetLink(forgotDto.email);
  }

  // src/auth/authentication.controller.ts

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
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
