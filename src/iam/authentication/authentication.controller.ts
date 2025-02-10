import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';

@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) {}

    @Post('signup')
    async signUp(@Body() signUpDto: SignUpDto) {
        return this.authService.signUp(signUpDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() signInDto: SignInDto) {
        console.log('signInDto', signInDto);
        return this.authService.signIn(signInDto);
    }
}
