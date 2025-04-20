import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerTestService {
  constructor(private readonly mailerService: MailerService) {}

  async sendTestEmail(to: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: `"Verstack" <${process.env.MAIL_FROM}>`,
        subject: '✅ Test d’envoi depuis NestJS via Brevo',
        html: `<p>Si tu vois ce mail, c’est que tout fonctionne bien 🚀</p>`,
      });

      return { success: true, message: 'Email envoyé avec succès !' };
    } catch (error) {
      console.error('Erreur d’envoi :', error);
      return { success: false, message: error.message };
    }
  }
}
