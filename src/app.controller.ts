import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerTestService } from './mailer-test.service';
import { Auth } from './iam/authentication/decorators/auth.decorator';
import { AuthType } from './iam/authentication/enums/auth-type.enum';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('test-mail')
export class MailerTestController {
  constructor(private readonly mailerTestService: MailerTestService) {}

  @Auth(AuthType.None)
  @Get()
  async test(@Query('to') to: string) {
    return this.mailerTestService.sendTestEmail(to);
  }
}