import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class EmailConfirmationService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private mailerService: MailerService
  ) {}

  async sendVerificationLink(user: User) {
    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.EMAIL_CONFIRMATION_SECRET,
      expiresIn: '1d',
    });

    const url = `http://verstack.io/confirm-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirmez votre adresse email',
      html: `<p>Merci de vous être inscrit. Cliquez sur le lien pour confirmer votre email :</p><a href="${url}">Confirmer</a>`,
    });
  }


}
