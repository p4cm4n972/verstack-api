// mail.service.ts

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(to: string, token: string) {
    const confirmUrl = `http://verstack.io/confirm-email?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Confirmation de votre adresse e-mail',
      html: `<p>Merci de vous être inscrit !</p>
             <p>Cliquez ici pour confirmer votre e-mail : <a href="${confirmUrl}">${confirmUrl}</a></p>`,
       // template: 'email-verification.html'
    });
  }


  async sendReinitialisationMail(user:any, token: string) {

    const resetLink = `https://verstack.io/reset-password?token=${token}`;

    await this.mailerService.sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <h3>Réinitialisation du mot de passe</h3>
          <p>Bonjour ${user.pseudo},</p>
          <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p>
          <a href="${resetLink}">Réinitialiser le mot de passe</a>
          <p>Ce lien expirera dans 15 minutes.</p>
        `,
    })

  }
}
