import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';

@Injectable()
export class MailerTestService {
  constructor(private readonly mailService: MailService) {}

  async sendTestEmail(to: string) {
    return this.mailService.sendTestEmail(to);
  }
}
